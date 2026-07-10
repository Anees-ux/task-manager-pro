using TaskManager.Domain.Enums;

namespace TaskManager.Application.DTOs;

public record TaskItemDto(
    int Id,
    string Title,
    string? Description,
    TaskItemStatus Status,
    Priority Priority,
    int ProjectId,
    string? ProjectName,
    DateTime? DueDate,
    DateTime CreatedAt,
    bool IsOverdue
);
