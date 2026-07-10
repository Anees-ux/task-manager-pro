using MediatR;
using TaskManager.Application.DTOs;
using TaskManager.Domain.Enums;

namespace TaskManager.Application.Features.Tasks.Commands.UpdateTask;

public record UpdateTaskCommand(
    int Id,
    string Title,
    string? Description,
    TaskItemStatus Status,
    Priority Priority,
    int ProjectId,
    DateTime? DueDate
) : IRequest<TaskItemDto>;
