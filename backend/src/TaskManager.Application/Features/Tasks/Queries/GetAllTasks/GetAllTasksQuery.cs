using MediatR;
using TaskManager.Application.DTOs;
using TaskManager.Domain.Entities.Execution;
using TaskManager.Domain.Entities.Financials;
using TaskManager.Domain.Entities.Workforce;
using TaskManager.Domain.Enums;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Features.Tasks.Queries.GetAllTasks;

public record GetAllTasksQuery(
    TaskItemStatus? Status = null,
    Priority? Priority = null,
    Guid? ProjectId = null,
    Guid? AssigneeId = null
) : IRequest<IReadOnlyList<TaskItemDto>>;

public class GetAllTasksHandler : IRequestHandler<GetAllTasksQuery, IReadOnlyList<TaskItemDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetAllTasksHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<TaskItemDto>> Handle(GetAllTasksQuery request, CancellationToken cancellationToken)
    {
        var taskRepo = _unitOfWork.Repository<TaskItem>();
        var projectRepo = _unitOfWork.Repository<Project>();
        var userRepo = _unitOfWork.Repository<User>();

        var tasks = await taskRepo.FindAsync(t =>
            (!request.Status.HasValue || t.Status == request.Status.Value) &&
            (!request.Priority.HasValue || t.Priority == request.Priority.Value) &&
            (!request.ProjectId.HasValue || t.ProjectId == request.ProjectId.Value) &&
            (!request.AssigneeId.HasValue || t.AssigneeId == request.AssigneeId.Value),
            cancellationToken);

        var projects = (await projectRepo.GetAllAsync(cancellationToken)).ToDictionary(p => p.Id, p => p.Name);
        var users = (await userRepo.GetAllAsync(cancellationToken)).ToDictionary(u => u.Id, u => u.FullName ?? u.Username);

        return tasks.Select(t => new TaskItemDto(
            t.Id,
            t.Title,
            t.Description,
            t.TaskCode,
            t.Status,
            t.Priority,
            t.ProjectId,
            projects.TryGetValue(t.ProjectId, out var pName) ? pName : null,
            t.AssigneeId,
            t.AssigneeId.HasValue && users.TryGetValue(t.AssigneeId.Value, out var uName) ? uName : null,
            t.ReporterId,
            t.EstimatedHours,
            t.ActualHours,
            t.StartDateUtc,
            t.DueDateUtc,
            t.CompletedAtUtc,
            t.RequiredSkills,
            t.CreatedAtUtc,
            t.DueDateUtc.HasValue && t.DueDateUtc.Value < DateTime.UtcNow && t.Status != TaskItemStatus.Done
        )).ToList();
    }
}
