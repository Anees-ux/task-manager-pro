using TaskManager.Domain.Common;
using TaskManager.Domain.Enums;

namespace TaskManager.Domain.Events;

/// <summary>
/// Raised when a new task is created.
/// Consumed by: Autonomous Task Auto-Assignment AI Agent and Neural Decision Ledger.
/// </summary>
public sealed class TaskCreatedEvent : IDomainEvent
{
    public Guid EventId { get; } = Guid.NewGuid();
    public DateTime OccurredAtUtc { get; } = DateTime.UtcNow;

    public Guid TaskId { get; }
    public Guid TenantId { get; }
    public string Title { get; }
    public string? Description { get; }
    public string? RequiredSkills { get; }
    public decimal EstimatedHours { get; }
    public Priority Priority { get; }
    public Guid? CurrentAssigneeId { get; }

    public TaskCreatedEvent(
        Guid taskId,
        Guid tenantId,
        string title,
        string? description,
        string? requiredSkills,
        decimal estimatedHours,
        Priority priority,
        Guid? currentAssigneeId = null)
    {
        TaskId = taskId;
        TenantId = tenantId;
        Title = title;
        Description = description;
        RequiredSkills = requiredSkills;
        EstimatedHours = estimatedHours;
        Priority = priority;
        CurrentAssigneeId = currentAssigneeId;
    }
}
