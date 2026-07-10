using MediatR;
using TaskManager.Application.DTOs;
using TaskManager.Domain.Enums;

namespace TaskManager.Application.Features.Tasks.Queries.GetAllTasks;

public record GetAllTasksQuery(
    TaskItemStatus? Status = null,
    Priority? Priority = null,
    int? ProjectId = null
) : IRequest<IReadOnlyList<TaskItemDto>>;
