using MediatR;
using TaskManager.Application.Common.Exceptions;
using TaskManager.Application.DTOs;
using TaskManager.Domain.Entities.Execution;
using TaskManager.Domain.Entities.Financials;
using TaskManager.Domain.Entities.Workforce;
using TaskManager.Domain.Enums;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Features.Tasks.Commands.TaskLifecycle;

public record AssignTaskCommand(Guid TaskId, Guid AssigneeId) : IRequest<TaskItemDto>;
public record ChangeTaskStatusCommand(Guid TaskId, TaskItemStatus Status) : IRequest<TaskItemDto>;
public record ShiftDeadlineCommand(Guid TaskId, DateTime? NewDeadlineUtc, string Reason) : IRequest<TaskItemDto>;

public class TaskLifecycleHandler :
    IRequestHandler<AssignTaskCommand, TaskItemDto>,
    IRequestHandler<ChangeTaskStatusCommand, TaskItemDto>,
    IRequestHandler<ShiftDeadlineCommand, TaskItemDto>
{
    private readonly IUnitOfWork _unitOfWork;

    public TaskLifecycleHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<TaskItemDto> Handle(AssignTaskCommand request, CancellationToken cancellationToken)
    {
        var taskRepo = _unitOfWork.Repository<TaskItem>();
        var userRepo = _unitOfWork.Repository<User>();

        var task = await taskRepo.GetByIdAsync(request.TaskId, cancellationToken)
            ?? throw new NotFoundException(nameof(TaskItem), request.TaskId);

        var user = await userRepo.GetByIdAsync(request.AssigneeId, cancellationToken)
            ?? throw new NotFoundException(nameof(User), request.AssigneeId);

        task.Assign(user.Id);
        taskRepo.Update(task);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return await MapToDto(task, cancellationToken);
    }

    public async Task<TaskItemDto> Handle(ChangeTaskStatusCommand request, CancellationToken cancellationToken)
    {
        var taskRepo = _unitOfWork.Repository<TaskItem>();

        var task = await taskRepo.GetByIdAsync(request.TaskId, cancellationToken)
            ?? throw new NotFoundException(nameof(TaskItem), request.TaskId);

        task.ChangeStatus(request.Status);
        taskRepo.Update(task);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return await MapToDto(task, cancellationToken);
    }

    public async Task<TaskItemDto> Handle(ShiftDeadlineCommand request, CancellationToken cancellationToken)
    {
        var taskRepo = _unitOfWork.Repository<TaskItem>();

        var task = await taskRepo.GetByIdAsync(request.TaskId, cancellationToken)
            ?? throw new NotFoundException(nameof(TaskItem), request.TaskId);

        task.ShiftDeadline(request.NewDeadlineUtc, request.Reason);
        taskRepo.Update(task);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return await MapToDto(task, cancellationToken);
    }

    private async Task<TaskItemDto> MapToDto(TaskItem task, CancellationToken cancellationToken)
    {
        var projectRepo = _unitOfWork.Repository<Project>();
        var project = await projectRepo.GetByIdAsync(task.ProjectId, cancellationToken);

        string? assigneeName = null;
        if (task.AssigneeId.HasValue)
        {
            var userRepo = _unitOfWork.Repository<User>();
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
