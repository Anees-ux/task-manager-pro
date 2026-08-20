using TaskManager.Domain.Common;
using TaskManager.Domain.Enums;

namespace TaskManager.Domain.Events;

/// <summary>
/// Raised when a task transitions between statuses.
/// Consumed by: AI StatusAgent, ripple effect analysis, project progress tracking.
/// </summary>
public sealed class TaskStatusChangedEvent : IDomainEvent
{
    public Guid EventId { get; } = Guid.NewGuid();
    public DateTime OccurredAtUtc { get; } = DateTime.UtcNow;

    public Guid TaskId { get; }
    public TaskItemStatus PreviousStatus { get; }
    public TaskItemStatus NewStatus { get; }

    public TaskStatusChangedEvent(Guid taskId, TaskItemStatus previousStatus, TaskItemStatus newStatus)
    {
        TaskId = taskId;
        PreviousStatus = previousStatus;
        NewStatus = newStatus;
    }
}
