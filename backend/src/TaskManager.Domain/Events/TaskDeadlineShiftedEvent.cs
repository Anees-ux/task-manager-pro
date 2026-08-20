using TaskManager.Domain.Common;

namespace TaskManager.Domain.Events;

/// <summary>
/// Raised when a task's deadline is shifted (manually or by the Ripple Effect Engine).
/// Consumed by: Dependency cascade analysis, stakeholder notifications.
/// </summary>
public sealed class TaskDeadlineShiftedEvent : IDomainEvent
{
    public Guid EventId { get; } = Guid.NewGuid();
    public DateTime OccurredAtUtc { get; } = DateTime.UtcNow;

    public Guid TaskId { get; }
    public DateTime? PreviousDeadlineUtc { get; }
    public DateTime? NewDeadlineUtc { get; }
    public string Reason { get; }

    public TaskDeadlineShiftedEvent(Guid taskId, DateTime? previousDeadlineUtc, DateTime? newDeadlineUtc, string reason)
    {
        TaskId = taskId;
        PreviousDeadlineUtc = previousDeadlineUtc;
        NewDeadlineUtc = newDeadlineUtc;
        Reason = reason;
    }
}
