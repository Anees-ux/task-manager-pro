using MediatR;
using TaskManager.Application.Common.Exceptions;
using TaskManager.Application.DTOs;
using TaskManager.Domain.Entities.Financials;
using TaskManager.Domain.Enums;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Features.Projects.Commands.UpdateProject;

public record UpdateProjectCommand(
    Guid Id,
    string Name,
    string? Description,
    ProjectStatus Status,
    decimal BudgetAllocated,
    DateTime? StartDate,
    DateTime? DeadlineUtc,
    Guid? ProjectManagerId
) : IRequest<ProjectDto>;

public class UpdateProjectHandler : IRequestHandler<UpdateProjectCommand, ProjectDto>
{
    private readonly IUnitOfWork _unitOfWork;

    public UpdateProjectHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ProjectDto> Handle(UpdateProjectCommand request, CancellationToken cancellationToken)
    {
        var projectRepo = _unitOfWork.Repository<Project>();
        var project = await projectRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Project), request.Id);

        project.UpdateDetails(request.Name, request.Description);
        project.ChangeStatus(request.Status);
        project.SetBudget(request.BudgetAllocated);
        project.SetStartDate(request.StartDate);
        project.SetDeadline(request.DeadlineUtc);

        if (request.ProjectManagerId.HasValue)
        {
            project.AssignProjectManager(request.ProjectManagerId.Value);
        }

        projectRepo.Update(project);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var taskRepo = _unitOfWork.Repository<TaskManager.Domain.Entities.Execution.TaskItem>();
        var taskCount = await taskRepo.CountAsync(t => t.ProjectId == project.Id, cancellationToken);

        return new ProjectDto(
            project.Id,
            project.Name,
            project.Description,
            project.ProjectCode,
            project.Status,
            project.BudgetAllocated,
            project.BudgetConsumed,
            project.BudgetUtilizationPercent,
            project.StartDate,
            project.DeadlineUtc,
            project.ProjectManagerId,
            project.CreatedAtUtc,
            taskCount
        );
    }
}
