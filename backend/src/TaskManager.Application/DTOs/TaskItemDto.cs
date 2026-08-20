using TaskManager.Domain.Enums;

namespace TaskManager.Application.DTOs;

public record TaskItemDto(
    Guid Id,
    string Title,
    string? Description,
    string TaskCode,
    TaskItemStatus Status,
    Priority Priority,
    Guid ProjectId,
    string? ProjectName,
    Guid? AssigneeId,
    string? AssigneeName,
    Guid? ReporterId,
    decimal EstimatedHours,
    decimal ActualHours,
    DateTime? StartDateUtc,
    DateTime? DueDateUtc,
    DateTime? CompletedAtUtc,
    string? RequiredSkills,
    DateTime CreatedAtUtc,
    bool IsOverdue
);

public record CreateTaskRequest(
    string Title,
    string? Description,
    string TaskCode,
    Guid ProjectId,
    Priority Priority = Priority.Medium,
    decimal EstimatedHours = 0,
    DateTime? DueDateUtc = null,
    Guid? AssigneeId = null,
    string? RequiredSkills = null
);

public record UpdateTaskRequest(
    string Title,
    string? Description,
    Priority Priority,
    decimal EstimatedHours,
    DateTime? DueDateUtc,
    string? RequiredSkills
);

public record AssignTaskRequest(
    Guid AssigneeId
);

public record ChangeTaskStatusRequest(
    TaskItemStatus Status
);

public record ShiftDeadlineRequest(
    DateTime? NewDeadlineUtc,
    string Reason
);

public record TaskDependencyDto(
    Guid Id,
    Guid PredecessorTaskId,
    string PredecessorTaskTitle,
    string PredecessorTaskCode,
    Guid SuccessorTaskId,
    string SuccessorTaskTitle,
    string SuccessorTaskCode,
    DependencyType Type,
    int LagDays
);

public record CreateTaskDependencyRequest(
    Guid PredecessorTaskId,
    Guid SuccessorTaskId,
    DependencyType Type = DependencyType.FinishToStart,
    int LagDays = 0
);

public record WorkLogDto(
    Guid Id,
    Guid TaskId,
    string TaskTitle,
    string TaskCode,
    Guid UserId,
    string UserName,
    DateOnly LogDate,
    decimal HoursWorked,
    string? Description,
    DateTime CreatedAtUtc
);

public record LogWorkRequest(
    Guid TaskId,
    DateOnly LogDate,
    decimal HoursWorked,
    string? Description
);
