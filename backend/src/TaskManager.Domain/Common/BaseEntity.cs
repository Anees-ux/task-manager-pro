namespace TaskManager.Domain.Common;

/// <summary>
/// Abstract base class for all domain entities.
/// Provides: Guid ID, multi-tenancy, soft-delete, audit trail, and domain events.
/// </summary>
public abstract class BaseEntity
{
    public Guid Id { get; protected set; } = Guid.NewGuid();

    /// <summary>
    /// Mandatory tenant identifier for multi-tenant data isolation.
    /// Set automatically by the DbContext SaveChanges interceptor.
    /// </summary>
    public Guid TenantId { get; protected set; }

    public DateTime CreatedAtUtc { get; protected set; } = DateTime.UtcNow;
    public DateTime? UpdatedAtUtc { get; protected set; }
    public string? CreatedBy { get; protected set; }
    public string? UpdatedBy { get; protected set; }

    /// <summary>
    /// Soft-delete flag. Entities are never physically deleted.
    /// Global Query Filters automatically exclude soft-deleted rows.
    /// </summary>
    public bool IsDeleted { get; protected set; }

    // ─── Domain Events ───────────────────────────────────────────
    private readonly List<IDomainEvent> _domainEvents = new();
    public IReadOnlyCollection<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    public void AddDomainEvent(IDomainEvent domainEvent) => _domainEvents.Add(domainEvent);
    public void ClearDomainEvents() => _domainEvents.Clear();

    // ─── Soft-Delete ─────────────────────────────────────────────
    public void MarkAsDeleted()
    {
        IsDeleted = true;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void Restore()
    {
        IsDeleted = false;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    // ─── Audit Helpers (called by DbContext interceptor) ─────────
    public void SetCreationAudit(Guid tenantId, string? userId)
    {
        TenantId = tenantId;
        CreatedBy = userId;
        CreatedAtUtc = DateTime.UtcNow;
    }

    public void SetUpdateAudit(string? userId)
    {
        UpdatedBy = userId;
        UpdatedAtUtc = DateTime.UtcNow;
    }
}
