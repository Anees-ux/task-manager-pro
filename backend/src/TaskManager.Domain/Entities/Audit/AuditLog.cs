namespace TaskManager.Domain.Entities.Audit;

/// <summary>
/// Audit trail for all entity state changes.
/// Does NOT inherit from BaseEntity — it IS the audit system and cannot audit itself.
/// Populated automatically by the AuditSaveChangesInterceptor.
/// </summary>
public class AuditLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }

    /// <summary>Fully qualified entity type name, e.g. "TaskItem".</summary>
    public string EntityType { get; set; } = string.Empty;

    /// <summary>Primary key of the affected entity.</summary>
    public Guid EntityId { get; set; }

    /// <summary>The operation: "Created", "Updated", "Deleted".</summary>
    public string Action { get; set; } = string.Empty;

    /// <summary>JSON: Previous property values (null for Create).</summary>
    public string? OldValues { get; set; }

    /// <summary>JSON: New property values (null for Delete).</summary>
    public string? NewValues { get; set; }

    /// <summary>JSON: List of property names that changed (for Update).</summary>
    public string? AffectedColumns { get; set; }

    /// <summary>User ID who performed the action.</summary>
    public string? UserId { get; set; }

    /// <summary>IP address of the request.</summary>
    public string? IpAddress { get; set; }

    public DateTime TimestampUtc { get; set; } = DateTime.UtcNow;
}
