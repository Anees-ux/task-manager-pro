using MediatR;
using TaskManager.Application.DTOs;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Features.Tasks.Commands.CreateTask;

public class CreateTaskHandler : IRequestHandler<CreateTaskCommand, TaskItemDto>
{
    private readonly IRepository<TaskItem> _taskRepository;

    public CreateTaskHandler(IRepository<TaskItem> taskRepository)
    {
        _taskRepository = taskRepository;
    }

    public async Task<TaskItemDto> Handle(CreateTaskCommand request, CancellationToken cancellationToken)
    {
        var taskItem = new TaskItem
        {
            Title = request.Title,
            Description = request.Description,
            Status = request.Status,
            Priority = request.Priority,
            ProjectId = request.ProjectId,
            DueDate = request.DueDate,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _taskRepository.AddAsync(taskItem, cancellationToken);

        return new TaskItemDto(
            created.Id,
            created.Title,
            created.Description,
            created.Status,
            created.Priority,
            created.ProjectId,
            null,
            created.DueDate,
            created.CreatedAt,
            created.DueDate.HasValue && created.DueDate.Value < DateTime.UtcNow && created.Status != Domain.Enums.TaskItemStatus.Done
        );
    }
}
