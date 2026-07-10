using MediatR;
using TaskManager.Application.Common.Exceptions;
using TaskManager.Application.DTOs;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Enums;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Features.Tasks.Queries.GetTaskById;

public class GetTaskByIdHandler : IRequestHandler<GetTaskByIdQuery, TaskItemDto>
{
    private readonly IRepository<TaskItem> _taskRepository;

    public GetTaskByIdHandler(IRepository<TaskItem> taskRepository)
    {
        _taskRepository = taskRepository;
    }

    public async Task<TaskItemDto> Handle(GetTaskByIdQuery request, CancellationToken cancellationToken)
    {
        var task = await _taskRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(TaskItem), request.Id);

        return new TaskItemDto(
            task.Id,
            task.Title,
            task.Description,
            task.Status,
            task.Priority,
            task.ProjectId,
            task.Project?.Name,
            task.DueDate,
            task.CreatedAt,
            task.DueDate.HasValue && task.DueDate.Value < DateTime.UtcNow && task.Status != TaskItemStatus.Done
        );
    }
}
