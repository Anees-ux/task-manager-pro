using MediatR;
using TaskManager.Application.Common.Exceptions;
using TaskManager.Application.DTOs;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Features.Tasks.Commands.UpdateTask;

public class UpdateTaskHandler : IRequestHandler<UpdateTaskCommand, TaskItemDto>
{
    private readonly IRepository<TaskItem> _taskRepository;

    public UpdateTaskHandler(IRepository<TaskItem> taskRepository)
    {
        _taskRepository = taskRepository;
    }

    public async Task<TaskItemDto> Handle(UpdateTaskCommand request, CancellationToken cancellationToken)
    {
        var task = await _taskRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(TaskItem), request.Id);

        task.Title = request.Title;
        task.Description = request.Description;
        task.Status = request.Status;
        task.Priority = request.Priority;
        task.ProjectId = request.ProjectId;
        task.DueDate = request.DueDate;

        await _taskRepository.UpdateAsync(task, cancellationToken);

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
            task.DueDate.HasValue && task.DueDate.Value < DateTime.UtcNow && task.Status != Domain.Enums.TaskItemStatus.Done
        );
    }
}
