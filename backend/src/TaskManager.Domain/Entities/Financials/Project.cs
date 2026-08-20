using TaskManager.Domain.Common;
using TaskManager.Domain.Entities.Workforce;
using TaskManager.Domain.Entities.Execution;
using TaskManager.Domain.Enums;

namespace TaskManager.Domain.Entities.Financials;

/// <summary>
/// Aggregate Root — Represents a project with budget tracking, deadlines, and financial sync.
/// Budget consumed is auto-calculated from WorkLogs × User.HourlyRate.
/// </summary>
public class Project : AggregateRoot
{
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }

    /// <summary>Auto-generated project code, e.g. "PRJ-001".</summary>
    public string ProjectCode { get; private set; } = string.Empty;

    public ProjectStatus Status { get; private set; } = ProjectStatus.Planning;

    /// <summary>Total budget allocated to this project (in currency units).</summary>
    public decimal BudgetAllocated { get; private set; }

    /// <summary>Budget consumed so far (calculated from WorkLogs × HourlyRate).</summary>
    public decimal BudgetConsumed { get; private set; }

    public DateTime? StartDate { get; private set; }
    public DateTime? DeadlineUtc { get; private set; }

    /// <summary>The project manager responsible for this project.</summary>
    public Guid? ProjectManagerId { get; private set; }

    // Navigation
    public ICollection<TaskItem> Tasks { get; private set; } = new List<TaskItem>();
    public User? ProjectManager { get; private set; }

    // ─── Private constructor for EF Core ─────────────────────────
    private Project() { }

    // ─── Factory Method ──────────────────────────────────────────
    public static Project Create(Guid tenantId, string name, string? description, string projectCode, decimal budgetAllocated = 0)
    {
        return new Project
        {
            TenantId = tenantId,
            Name = name,
            Description = description,
            ProjectCode = projectCode,
            BudgetAllocated = budgetAllocated,
            Status = ProjectStatus.Planning,
        };
    }

    // ─── Domain Methods ──────────────────────────────────────────
    public void UpdateDetails(string name, string? description)
    {
        Name = name;
        Description = description;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void SetBudget(decimal budget)
    {
        if (budget < 0)
            throw new ArgumentOutOfRangeException(nameof(budget), "Budget cannot be negative.");

        BudgetAllocated = budget;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void AddBudgetConsumed(decimal amount)
    {
        BudgetConsumed += amount;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void SetDeadline(DateTime? deadline)
    {
        DeadlineUtc = deadline;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void SetStartDate(DateTime? startDate)
    {
        StartDate = startDate;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void AssignProjectManager(Guid userId)
    {
        ProjectManagerId = userId;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void ChangeStatus(ProjectStatus newStatus)
    {
        // Validate status transitions
        if (Status == ProjectStatus.Archived && newStatus != ProjectStatus.Active)
            throw new InvalidOperationException("Archived projects can only be reactivated.");

        Status = newStatus;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    /// <summary>Percentage of budget consumed.</summary>
    public decimal BudgetUtilizationPercent =>
        BudgetAllocated > 0 ? Math.Round(BudgetConsumed / BudgetAllocated * 100, 2) : 0;
}
