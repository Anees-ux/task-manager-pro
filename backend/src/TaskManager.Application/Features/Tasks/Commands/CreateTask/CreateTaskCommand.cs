using MediatR;
using TaskManager.Application.Common.Exceptions;
using TaskManager.Application.DTOs;
using TaskManager.Application.Interfaces;
using TaskManager.Domain.Entities.Execution;
using TaskManager.Domain.Entities.Financials;
using TaskManager.Domain.Entities.Workforce;
using TaskManager.Domain.Enums;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Features.Tasks.Commands.CreateTask;

public record CreateTaskCommand(
    string Title,
    string? Description,
    string TaskCode,
    Guid ProjectId,
    Priority Priority = Priority.Medium,
    decimal EstimatedHours = 0,
    DateTime? DueDateUtc = null,
    Guid? AssigneeId = null,
    string? RequiredSkills = null
) : IRequest<TaskItemDto>;

public class CreateTaskHandler : IRequestHandler<CreateTaskCommand, TaskItemDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITenantService _tenantService;

    public CreateTaskHandler(IUnitOfWork unitOfWork, ITenantService tenantService)
    {
        _unitOfWork = unitOfWork;
        _tenantService = tenantService;
    }

    public async Task<TaskItemDto> Handle(CreateTaskCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        var reporterUserIdStr = _tenantService.GetCurrentUserId();
        Guid? reporterId = Guid.TryParse(reporterUserIdStr, out var rId) ? rId : null;

        var projectRepo = _unitOfWork.Repository<Project>();
        var project = await projectRepo.GetByIdAsync(request.ProjectId, cancellationToken)
            ?? throw new NotFoundException(nameof(Project), request.ProjectId);

        var taskRepo = _unitOfWork.Repository<TaskItem>();
        var existingCode = await taskRepo.AnyAsync(
            t => t.TaskCode == request.TaskCode, cancellationToken);

        if (existingCode)
        {
            throw new Common.Exceptions.ValidationException(
                new[] { new FluentValidation.Results.ValidationFailure("TaskCode", $"Task code '{request.TaskCode}' already exists.") });
        }

        var task = TaskItem.Create(
            tenantId,
            request.Title,
            request.Description,
            request.TaskCode,
            request.ProjectId,
            request.Priority,
            request.EstimatedHours,
            reporterId,
            request.RequiredSkills
        );

        if (request.DueDateUtc.HasValue)
        {
            task.SetDueDate(request.DueDateUtc);
        }

        if (request.AssigneeId.HasValue)
        {
            task.Assign(request.AssigneeId.Value);
        }

        await taskRepo.AddAsync(task, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

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
            project.Name,
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
