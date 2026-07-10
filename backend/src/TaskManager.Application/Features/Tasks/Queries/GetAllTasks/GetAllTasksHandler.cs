using MediatR;
using TaskManager.Application.DTOs;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Features.Tasks.Queries.GetAllTasks;

public class GetAllTasksHandler : IRequestHandler<GetAllTasksQuery, IReadOnlyList<TaskItemDto>>
{
    private readonly IRepository<TaskItem> _taskRepository;

    public GetAllTasksHandler(IRepository<TaskItem> taskRepository)
    {
        _taskRepository = taskRepository;
    }

    public async Task<IReadOnlyList<TaskItemDto>> Handle(GetAllTasksQuery request, CancellationToken cancellationToken)
    {
        var tasks = await _taskRepository.GetAllAsync(cancellationToken);

        // Apply filters
        var filtered = tasks.AsEnumerable();

        if (request.Status.HasValue)
            filtered = filtered.Where(t => t.Status == request.Status.Value);

        if (request.Priority.HasValue)
            filtered = filtered.Where(t => t.Priority == request.Priority.Value);

        if (request.ProjectId.HasValue)
            filtered = filtered.Where(t => t.ProjectId == request.ProjectId.Value);

        return filtered.Select(t => new TaskItemDto(
            t.Id,
            t.Title,
            t.Description,
            t.Status,
            t.Priority,
            t.ProjectId,
            t.Project?.Name,
            t.DueDate,
            t.CreatedAt,
            t.DueDate.HasValue && t.DueDate.Value < DateTime.UtcNow && t.Status != Domain.Enums.TaskItemStatus.Done
        )).ToList().AsReadOnly();
    }
}
