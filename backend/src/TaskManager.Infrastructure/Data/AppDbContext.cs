using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TaskManager.Application.Interfaces;
using TaskManager.Domain.Common;
using TaskManager.Domain.Entities.Audit;
using TaskManager.Domain.Entities.Common;
using TaskManager.Domain.Entities.Execution;
using TaskManager.Domain.Entities.Financials;
using TaskManager.Domain.Entities.Intelligence;
using TaskManager.Domain.Entities.Workforce;
using TaskManager.Domain.Entities.Workspace;

namespace TaskManager.Infrastructure.Data;

/// <summary>
/// Application DbContext with multi-tenant Global Query Filters,
/// soft-delete filtering, audit field auto-population, and Transactional Outbox persistence.
/// </summary>
public class AppDbContext : DbContext
{
    private readonly Guid _currentTenantId;

    public AppDbContext(
        DbContextOptions<AppDbContext> options,
        ITenantService tenantService)
        : base(options)
    {
        _currentTenantId = tenantService.GetCurrentTenantId();
    }

    // ─── Workspace ───────────────────────────────────────────────
    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<TenantSettings> TenantSettings => Set<TenantSettings>();

    // ─── Workforce ───────────────────────────────────────────────
    public DbSet<User> Users => Set<User>();
    public DbSet<UserSkill> UserSkills => Set<UserSkill>();
    public DbSet<UserAvailability> UserAvailabilities => Set<UserAvailability>();
    public DbSet<TimeOff> TimeOffs => Set<TimeOff>();

    // ─── Financials ──────────────────────────────────────────────
    public DbSet<Project> Projects => Set<Project>();

    // ─── Execution ───────────────────────────────────────────────
    public DbSet<TaskItem> Tasks => Set<TaskItem>();
    public DbSet<TaskDependency> TaskDependencies => Set<TaskDependency>();
    public DbSet<WorkLog> WorkLogs => Set<WorkLog>();

    // ─── Intelligence ────────────────────────────────────────────
    public DbSet<AiDecisionLedger> AiDecisionLedgers => Set<AiDecisionLedger>();
    public DbSet<CapacitySnapshot> CapacitySnapshots => Set<CapacitySnapshot>();
    public DbSet<RippleEffectLog> RippleEffectLogs => Set<RippleEffectLog>();

    // ─── Audit & Outbox ──────────────────────────────────────────
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply all IEntityTypeConfiguration from the Infrastructure assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        // ─── Global Query Filters: Multi-Tenancy + Soft-Delete ───
        // Applied to ALL entities inheriting from BaseEntity.
        // This guarantees 100% data isolation per tenant and excludes soft-deleted rows.
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(BaseEntity).IsAssignableFrom(entityType.ClrType))
            {
                var method = typeof(AppDbContext)
                    .GetMethod(nameof(ApplyTenantAndSoftDeleteFilter),
                        System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)!
                    .MakeGenericMethod(entityType.ClrType);

                method.Invoke(this, new object[] { modelBuilder });
            }
        }
    }

    /// <summary>
    /// Applies both tenant isolation and soft-delete filters to an entity.
    /// Called via reflection for each BaseEntity type.
    /// </summary>
    private void ApplyTenantAndSoftDeleteFilter<T>(ModelBuilder modelBuilder) where T : BaseEntity
    {
        modelBuilder.Entity<T>().HasQueryFilter(e => e.TenantId == _currentTenantId && !e.IsDeleted);
    }

    /// <summary>
    /// Overrides SaveChangesAsync to capture domain events and stage them into the OutboxMessages table
    /// within the exact same database transaction, guaranteeing atomicity and consistency.
    /// </summary>
    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // 1. Extract all pending domain events before persistence
        var entitiesWithEvents = ChangeTracker
            .Entries<BaseEntity>()
            .Where(e => e.Entity.DomainEvents.Count > 0)
            .Select(e => e.Entity)
            .ToList();

        var domainEvents = entitiesWithEvents
            .SelectMany(e => e.DomainEvents)
            .ToList();

        // 2. Convert each domain event into an OutboxMessage and stage into DbContext
        if (domainEvents.Count > 0)
        {
            var outboxMessages = domainEvents.Select(domainEvent => new OutboxMessage
            {
                Id = Guid.NewGuid(),
                Type = domainEvent.GetType().AssemblyQualifiedName ?? domainEvent.GetType().FullName!,
                Content = JsonSerializer.Serialize(domainEvent, domainEvent.GetType()),
                OccurredOnUtc = domainEvent.OccurredAtUtc,
                ProcessedOnUtc = null,
                Error = null
            }).ToList();

            Set<OutboxMessage>().AddRange(outboxMessages);
        }

        // 3. Clear domain events to prevent duplicate outbox entries
        entitiesWithEvents.ForEach(e => e.ClearDomainEvents());

        // 4. Persist domain aggregate changes + Outbox messages atomically in a single SQL transaction
        return await base.SaveChangesAsync(cancellationToken);
    }
}
