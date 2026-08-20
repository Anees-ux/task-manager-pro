using MediatR;
using TaskManager.Application.Common.Exceptions;
using TaskManager.Application.DTOs;
using TaskManager.Domain.Entities.Execution;
using TaskManager.Domain.Entities.Financials;
using TaskManager.Domain.Entities.Workforce;
using TaskManager.Domain.Enums;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Features.Tasks.Queries.GetTaskById;

public record GetTaskByIdQuery(Guid Id) : IRequest<TaskItemDto>;

public class GetTaskByIdHandler : IRequestHandler<GetTaskByIdQuery, TaskItemDto>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetTaskByIdHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<TaskItemDto> Handle(GetTaskByIdQuery request, CancellationToken cancellationToken)
    {
        var taskRepo = _unitOfWork.Repository<TaskItem>();
        var projectRepo = _unitOfWork.Repository<Project>();
        var userRepo = _unitOfWork.Repository<User>();

        var task = await taskRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(TaskItem), request.Id);

        var project = await projectRepo.GetByIdAsync(task.ProjectId, cancellationToken);

        string? assigneeName = null;
        if (task.AssigneeId.HasValue)
        {
            var assignee = await userRepo.GetByIdAsync(task.AssigneeId.Value, cancellationToken);
            assigneeName = assignee?.FullName ?? assignee?.Username;
        }

        return new TaskItemDto(
            task.Id,
            task.Title,
            task.Description,
            task.TaskCode,
            task.Status,
            task.Priority,
            task.ProjectId,
            project?.Name,
            task.AssigneeId,
            assigneeName,
            task.ReporterId,
            task.EstimatedHours,
            task.ActualHours,
            task.StartDateUtc,
            task.DueDateUtc,
            task.CompletedAtUtc,
            task.RequiredSkills,
            task.CreatedAtUtc,
            task.DueDateUtc.HasValue && task.DueDateUtc.Value < DateTime.UtcNow && task.Status != TaskItemStatus.Done
        );
    }
}
