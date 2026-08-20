using TaskManager.Domain.Common;

namespace TaskManager.Domain.Events;

/// <summary>
/// Raised when a work log entry is created.
/// Consumed by: Task actual hours update, capacity snapshot recalculation, budget burn tracking.
/// </summary>
public sealed class WorkLogCreatedEvent : IDomainEvent
{
    public Guid EventId { get; } = Guid.NewGuid();
    public DateTime OccurredAtUtc { get; } = DateTime.UtcNow;

    public Guid WorkLogId { get; }
    public Guid TaskId { get; }
    public Guid UserId { get; }
    public decimal HoursWorked { get; }
    public DateOnly LogDate { get; }

    public WorkLogCreatedEvent(Guid workLogId, Guid taskId, Guid userId, decimal hoursWorked, DateOnly logDate)
    {
        WorkLogId = workLogId;
        TaskId = taskId;
        UserId = userId;
        HoursWorked = hoursWorked;
        LogDate = logDate;
    }
}
