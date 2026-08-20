using TaskManager.Domain.Common;

namespace TaskManager.Domain.Entities.Intelligence;

/// <summary>
/// Immutable audit log of every ripple effect cascade.
/// When a task's deadline shifts, the Ripple Effect Engine traces all dependent tasks
/// and records the full impact graph here.
/// </summary>
public class RippleEffectLog : BaseEntity
{
    /// <summary>The task that initiated the cascade.</summary>
    public Guid TriggerTaskId { get; private set; }

    /// <summary>What event triggered the cascade, e.g. "DeadlineChanged", "StatusChanged".</summary>
    public string TriggerEvent { get; private set; } = string.Empty;

    /// <summary>JSON: Serialized graph of all affected tasks with old/new deadlines.</summary>
    public string AffectedTasksJson { get; private set; } = string.Empty;

    /// <summary>Total count of downstream tasks impacted.</summary>
    public int TotalTasksAffected { get; private set; }

    // ─── Private constructor for EF Core ─────────────────────────
    private RippleEffectLog() { }

    // ─── Factory Method ──────────────────────────────────────────
    public static RippleEffectLog Create(
        Guid tenantId,
        Guid triggerTaskId,
        string triggerEvent,
        string affectedTasksJson,
        int totalTasksAffected)
    {
        return new RippleEffectLog
        {
            TenantId = tenantId,
            TriggerTaskId = triggerTaskId,
            TriggerEvent = triggerEvent,
            AffectedTasksJson = affectedTasksJson,
            TotalTasksAffected = totalTasksAffected,
        };
    }
}
