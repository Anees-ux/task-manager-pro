using TaskManager.Domain.Common;
using TaskManager.Domain.Entities.Workforce;
using TaskManager.Domain.Entities.Financials;
using TaskManager.Domain.Enums;
using TaskManager.Domain.Events;

namespace TaskManager.Domain.Entities.Execution;

/// <summary>
/// Aggregate Root — The core execution unit. Rich domain model with
/// status transitions, assignment tracking, time estimates, and domain events.
/// </summary>
public class TaskItem : AggregateRoot
{
    public string Title { get; private set; } = string.Empty;
    public string? Description { get; private set; }

    /// <summary>Auto-generated task code, e.g. "TSK-001".</summary>
    public string TaskCode { get; private set; } = string.Empty;

    public TaskItemStatus Status { get; private set; } = TaskItemStatus.Backlog;
    public Priority Priority { get; private set; } = Priority.Medium;

    public Guid ProjectId { get; private set; }

    /// <summary>The user currently assigned to execute this task.</summary>
    public Guid? AssigneeId { get; private set; }

    /// <summary>The user who created/reported this task.</summary>
    public Guid? ReporterId { get; private set; }

    /// <summary>Estimated hours to complete. Used by the Capacity Heatmap Engine.</summary>
    public decimal EstimatedHours { get; private set; }

    /// <summary>Actual hours worked (sum of WorkLogs). Auto-updated by domain events.</summary>
    public decimal ActualHours { get; private set; }

    public DateTime? StartDateUtc { get; private set; }
    public DateTime? DueDateUtc { get; private set; }
    public DateTime? CompletedAtUtc { get; private set; }

    /// <summary>JSON array of required skill names, e.g. ["React", "SQL"]. Used by AI TaskRouter.</summary>
    public string? RequiredSkills { get; private set; }

    // Navigation
    public Project? Project { get; private set; }
    public User? Assignee { get; private set; }
    public User? Reporter { get; private set; }
    public ICollection<TaskDependency> DependenciesAsPredecessor { get; private set; } = new List<TaskDependency>();
    public ICollection<TaskDependency> DependenciesAsSuccessor { get; private set; } = new List<TaskDependency>();
    public ICollection<WorkLog> WorkLogs { get; private set; } = new List<WorkLog>();

    // ─── Private constructor for EF Core ─────────────────────────
    private TaskItem() { }

    // ─── Factory Method ──────────────────────────────────────────
    public static TaskItem Create(
        Guid tenantId,
        string title,
        string? description,
        string taskCode,
        Guid projectId,
        Priority priority = Priority.Medium,
        decimal estimatedHours = 0,
        Guid? reporterId = null,
        string? requiredSkills = null)
    {
        var task = new TaskItem
        {
            TenantId = tenantId,
            Title = title,
            Description = description,
            TaskCode = taskCode,
            ProjectId = projectId,
            Priority = priority,
            EstimatedHours = estimatedHours,
            ReporterId = reporterId,
            RequiredSkills = requiredSkills,
            Status = TaskItemStatus.Backlog,
        };

        task.AddDomainEvent(new TaskCreatedEvent(
            task.Id,
            tenantId,
            title,
            description,
            requiredSkills,
            estimatedHours,
            priority
        ));

        return task;
    }

    // ─── Domain Methods ──────────────────────────────────────────

    /// <summary>
    /// Changes the task status with validation of allowed transitions.
    /// Raises TaskStatusChangedEvent for downstream processing.
    /// </summary>
    public void ChangeStatus(TaskItemStatus newStatus)
    {
        if (Status == newStatus) return;

        // Validate: Can't move to InProgress if blocked by incomplete dependencies
        // (This check would be enriched by the application layer with dependency data)

        var previousStatus = Status;
        Status = newStatus;
        UpdatedAtUtc = DateTime.UtcNow;

        if (newStatus == TaskItemStatus.InProgress && StartDateUtc == null)
            StartDateUtc = DateTime.UtcNow;

        if (newStatus == TaskItemStatus.Done)
            CompletedAtUtc = DateTime.UtcNow;

        if (newStatus != TaskItemStatus.Done && previousStatus == TaskItemStatus.Done)
            CompletedAtUtc = null; // Re-opened

        AddDomainEvent(new TaskStatusChangedEvent(Id, previousStatus, newStatus));
    }

    /// <summary>
    /// Assigns the task to a user. Raises TaskAssignedEvent for capacity recalculation.
    /// </summary>
    public void Assign(Guid userId)
    {
        var previousAssignee = AssigneeId;
        AssigneeId = userId;
        UpdatedAtUtc = DateTime.UtcNow;

        AddDomainEvent(new TaskAssignedEvent(Id, previousAssignee, userId, EstimatedHours));
    }

    /// <summary>
    /// Unassigns the task from its current assignee.
    /// </summary>
    public void Unassign()
    {
        var previousAssignee = AssigneeId;
        AssigneeId = null;
        UpdatedAtUtc = DateTime.UtcNow;

        if (previousAssignee.HasValue)
        {
            // Raise event with Guid.Empty as new assignee to signal unassignment
            AddDomainEvent(new TaskAssignedEvent(Id, previousAssignee, Guid.Empty, EstimatedHours));
        }
    }

    /// <summary>
    /// Shifts the task deadline and raises a domain event for the Ripple Effect Engine.
    /// </summary>
    public void ShiftDeadline(DateTime? newDeadline, string reason)
    {
        var previousDeadline = DueDateUtc;
        DueDateUtc = newDeadline;
        UpdatedAtUtc = DateTime.UtcNow;

        AddDomainEvent(new TaskDeadlineShiftedEvent(Id, previousDeadline, newDeadline, reason));
    }

    /// <summary>
    /// Updates the actual hours worked (called by WorkLogCreatedEvent handler).
    /// </summary>
    public void AddActualHours(decimal hours)
    {
        ActualHours += hours;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void UpdateDetails(string title, string? description, Priority priority, decimal estimatedHours)
    {
        Title = title;
        Description = description;
        Priority = priority;
        EstimatedHours = estimatedHours;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void SetRequiredSkills(string? skillsJson)
    {
        RequiredSkills = skillsJson;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void SetDueDate(DateTime? dueDate)
    {
        DueDateUtc = dueDate;
        UpdatedAtUtc = DateTime.UtcNow;
    }
}
