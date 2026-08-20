using TaskManager.Domain.Common;

namespace TaskManager.Domain.Events;

/// <summary>
/// Raised when a task is assigned or reassigned to a user.
/// Consumed by: CapacitySnapshot recalculation, notification system.
/// </summary>
public sealed class TaskAssignedEvent : IDomainEvent
{
    public Guid EventId { get; } = Guid.NewGuid();
    public DateTime OccurredAtUtc { get; } = DateTime.UtcNow;

    public Guid TaskId { get; }
    public Guid? PreviousAssigneeId { get; }
    public Guid NewAssigneeId { get; }
    public decimal EstimatedHours { get; }

    public TaskAssignedEvent(Guid taskId, Guid? previousAssigneeId, Guid newAssigneeId, decimal estimatedHours)
    {
        TaskId = taskId;
        PreviousAssigneeId = previousAssigneeId;
        NewAssigneeId = newAssigneeId;
        EstimatedHours = estimatedHours;
    }
}
