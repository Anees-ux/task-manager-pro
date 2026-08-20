using TaskManager.Domain.Enums;

namespace TaskManager.Application.DTOs;

public record ProjectDto(
    Guid Id,
    string Name,
    string? Description,
    string ProjectCode,
    ProjectStatus Status,
    decimal BudgetAllocated,
    decimal BudgetConsumed,
    decimal BudgetUtilizationPercent,
    DateTime? StartDate,
    DateTime? DeadlineUtc,
    Guid? ProjectManagerId,
    DateTime CreatedAtUtc,
    int TaskCount
);

public record CreateProjectRequest(
    string Name,
    string? Description,
    string ProjectCode,
    decimal BudgetAllocated = 0,
    DateTime? StartDate = null,
    DateTime? DeadlineUtc = null,
    Guid? ProjectManagerId = null
);

public record UpdateProjectRequest(
    string Name,
    string? Description,
    ProjectStatus Status,
    decimal BudgetAllocated,
    DateTime? StartDate,
    DateTime? DeadlineUtc,
    Guid? ProjectManagerId
);

public record ProjectBudgetReportDto(
    Guid ProjectId,
    string ProjectName,
    string ProjectCode,
    decimal BudgetAllocated,
    decimal BudgetConsumed,
    decimal BudgetUtilizationPercent,
    decimal RemainingBudget,
    int TotalTasks,
    int CompletedTasks,
    decimal TotalHoursLogged
);
