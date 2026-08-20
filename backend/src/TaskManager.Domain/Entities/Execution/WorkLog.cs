using TaskManager.Domain.Common;
using TaskManager.Domain.Entities.Workforce;
using TaskManager.Domain.Events;

namespace TaskManager.Domain.Entities.Execution;

/// <summary>
/// Tracks actual time logged against a task by a user.
/// Auto-updates TaskItem.ActualHours and feeds Project.BudgetConsumed calculations.
/// </summary>
public class WorkLog : BaseEntity
{
    public Guid TaskId { get; private set; }
    public Guid UserId { get; private set; }
    public DateOnly LogDate { get; private set; }
    public decimal HoursWorked { get; private set; }
    public string? Description { get; private set; }

    // Navigation
    public TaskItem? Task { get; private set; }
    public User? User { get; private set; }

    // ─── Private constructor for EF Core ─────────────────────────
    private WorkLog() { }

    // ─── Factory Method ──────────────────────────────────────────
    public static WorkLog Create(Guid tenantId, Guid taskId, Guid userId, DateOnly logDate, decimal hoursWorked, string? description = null)
    {
        if (hoursWorked <= 0)
            throw new ArgumentOutOfRangeException(nameof(hoursWorked), "Hours worked must be positive.");

        if (hoursWorked > 24)
            throw new ArgumentOutOfRangeException(nameof(hoursWorked), "Hours worked cannot exceed 24 in a day.");

        var workLog = new WorkLog
        {
            TenantId = tenantId,
            TaskId = taskId,
            UserId = userId,
            LogDate = logDate,
            HoursWorked = hoursWorked,
            Description = description,
        };

        // Raise domain event for capacity recalculation + task actual hours update
        workLog.AddDomainEvent(new WorkLogCreatedEvent(workLog.Id, taskId, userId, hoursWorked, logDate));

        return workLog;
    }

    // ─── Domain Methods ──────────────────────────────────────────
    public void UpdateHours(decimal newHours)
    {
        if (newHours <= 0)
            throw new ArgumentOutOfRangeException(nameof(newHours), "Hours worked must be positive.");

        HoursWorked = newHours;
        UpdatedAtUtc = DateTime.UtcNow;
    }
}
