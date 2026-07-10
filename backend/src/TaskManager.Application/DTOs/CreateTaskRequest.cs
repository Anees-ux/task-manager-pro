using TaskManager.Domain.Enums;

namespace TaskManager.Application.DTOs;

public record CreateTaskRequest(
    string Title,
    string? Description,
    TaskItemStatus Status,
    Priority Priority,
    int ProjectId,
    DateTime? DueDate
);
