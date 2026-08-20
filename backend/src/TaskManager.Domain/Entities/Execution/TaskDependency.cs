using TaskManager.Domain.Common;
using TaskManager.Domain.Enums;

namespace TaskManager.Domain.Entities.Execution;

/// <summary>
/// Represents a dependency link between two tasks.
/// Used by the Ripple Effect Engine to propagate timeline impacts.
/// </summary>
public class TaskDependency : BaseEntity
{
    /// <summary>The task that must complete first (blocker).</summary>
    public Guid PredecessorTaskId { get; private set; }

    /// <summary>The task that is blocked until the predecessor completes.</summary>
    public Guid SuccessorTaskId { get; private set; }

    /// <summary>Type of dependency relationship.</summary>
    public DependencyType Type { get; private set; } = DependencyType.FinishToStart;

    /// <summary>Offset days: "Start N days after predecessor finishes".</summary>
    public int LagDays { get; private set; }

    // Navigation
    public TaskItem? PredecessorTask { get; private set; }
    public TaskItem? SuccessorTask { get; private set; }

    // ─── Private constructor for EF Core ─────────────────────────
    private TaskDependency() { }

    // ─── Factory Method ──────────────────────────────────────────
    public static TaskDependency Create(
        Guid tenantId,
        Guid predecessorTaskId,
        Guid successorTaskId,
        DependencyType type = DependencyType.FinishToStart,
        int lagDays = 0)
    {
        if (predecessorTaskId == successorTaskId)
            throw new InvalidOperationException("A task cannot depend on itself.");

        return new TaskDependency
        {
            TenantId = tenantId,
            PredecessorTaskId = predecessorTaskId,
            SuccessorTaskId = successorTaskId,
            Type = type,
            LagDays = lagDays,
        };
    }
}
