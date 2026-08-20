using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using TaskManager.Application.Interfaces;
using TaskManager.Domain.Common;
using TaskManager.Domain.Entities.Audit;

namespace TaskManager.Infrastructure.Interceptors;

/// <summary>
/// EF Core SaveChanges interceptor that automatically logs all entity state changes
/// into the AuditLogs table. Captures old/new values as JSON for full traceability.
/// 
/// Skips auditing of AuditLog entities to prevent infinite recursion.
/// </summary>
public class AuditSaveChangesInterceptor : SaveChangesInterceptor
{
    private readonly ITenantService _tenantService;

    public AuditSaveChangesInterceptor(ITenantService tenantService)
    {
        _tenantService = tenantService;
    }

    public override async ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        if (eventData.Context is not null)
        {
            await OnBeforeSaveChangesAsync(eventData.Context);
        }

        return await base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    private Task OnBeforeSaveChangesAsync(DbContext context)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        var userId = _tenantService.GetCurrentUserId();
        var ipAddress = _tenantService.GetCurrentIpAddress();
        var auditEntries = new List<AuditLog>();

        foreach (var entry in context.ChangeTracker.Entries<BaseEntity>())
        {
            // Skip unchanged entries and AuditLog entries (prevent recursion)
            if (entry.State == EntityState.Detached || entry.State == EntityState.Unchanged)
                continue;

            // Auto-set audit fields
            if (entry.State == EntityState.Added)
            {
                entry.Entity.SetCreationAudit(tenantId, userId);
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.SetUpdateAudit(userId);
            }

            var auditLog = new AuditLog
            {
                TenantId = tenantId,
                EntityType = entry.Entity.GetType().Name,
                EntityId = entry.Entity.Id,
                UserId = userId,
                IpAddress = ipAddress,
                TimestampUtc = DateTime.UtcNow,
            };

            switch (entry.State)
            {
                case EntityState.Added:
                    auditLog.Action = "Created";
                    auditLog.NewValues = SerializeProperties(entry.Properties
                        .Where(p => p.CurrentValue != null)
                        .ToDictionary(p => p.Metadata.Name, p => p.CurrentValue));
                    break;

                case EntityState.Modified:
                    auditLog.Action = "Updated";
                    var modifiedProps = entry.Properties
                        .Where(p => p.IsModified)
                        .ToList();
                    auditLog.OldValues = SerializeProperties(modifiedProps
                        .ToDictionary(p => p.Metadata.Name, p => p.OriginalValue));
                    auditLog.NewValues = SerializeProperties(modifiedProps
                        .ToDictionary(p => p.Metadata.Name, p => p.CurrentValue));
                    auditLog.AffectedColumns = JsonSerializer.Serialize(modifiedProps
                        .Select(p => p.Metadata.Name).ToList());
                    break;

                case EntityState.Deleted:
                    auditLog.Action = "Deleted";
                    auditLog.OldValues = SerializeProperties(entry.Properties
                        .ToDictionary(p => p.Metadata.Name, p => p.OriginalValue));
                    break;
            }

            auditEntries.Add(auditLog);
        }

        if (auditEntries.Count > 0)
        {
            context.Set<AuditLog>().AddRange(auditEntries);
        }

        return Task.CompletedTask;
    }

    private static string? SerializeProperties(Dictionary<string, object?> properties)
    {
        try
        {
            return JsonSerializer.Serialize(properties, new JsonSerializerOptions
            {
                WriteIndented = false,
                DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
            });
        }
        catch
        {
            return null;
        }
    }
}
