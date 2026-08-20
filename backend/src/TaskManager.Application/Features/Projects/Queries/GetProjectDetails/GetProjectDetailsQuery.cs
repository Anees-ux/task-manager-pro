using MediatR;
using TaskManager.Application.Common.Exceptions;
using TaskManager.Application.DTOs;
using TaskManager.Domain.Entities.Execution;
using TaskManager.Domain.Entities.Financials;
using TaskManager.Domain.Enums;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Features.Projects.Queries.GetProjectDetails;

public record GetProjectByIdQuery(Guid Id) : IRequest<ProjectDto>;
public record GetProjectBudgetReportQuery(Guid ProjectId) : IRequest<ProjectBudgetReportDto>;

public class GetProjectDetailsHandler :
    IRequestHandler<GetProjectByIdQuery, ProjectDto>,
    IRequestHandler<GetProjectBudgetReportQuery, ProjectBudgetReportDto>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetProjectDetailsHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ProjectDto> Handle(GetProjectByIdQuery request, CancellationToken cancellationToken)
    {
        var projectRepo = _unitOfWork.Repository<Project>();
        var taskRepo = _unitOfWork.Repository<TaskItem>();

        var project = await projectRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Project), request.Id);

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

    public async Task<ProjectBudgetReportDto> Handle(GetProjectBudgetReportQuery request, CancellationToken cancellationToken)
    {
        var projectRepo = _unitOfWork.Repository<Project>();
        var taskRepo = _unitOfWork.Repository<TaskItem>();
        var workLogRepo = _unitOfWork.Repository<WorkLog>();

        var project = await projectRepo.GetByIdAsync(request.ProjectId, cancellationToken)
            ?? throw new NotFoundException(nameof(Project), request.ProjectId);

        var tasks = await taskRepo.FindAsync(t => t.ProjectId == project.Id, cancellationToken);
        var totalTasks = tasks.Count;
        var completedTasks = tasks.Count(t => t.Status == TaskItemStatus.Done);

        var taskIds = tasks.Select(t => t.Id).ToHashSet();
        var allWorkLogs = await workLogRepo.FindAsync(w => taskIds.Contains(w.TaskId), cancellationToken);
        var totalHoursLogged = allWorkLogs.Sum(w => w.HoursWorked);

        return new ProjectBudgetReportDto(
            project.Id,
            project.Name,
            project.ProjectCode,
            project.BudgetAllocated,
            project.BudgetConsumed,
            project.BudgetUtilizationPercent,
            Math.Max(project.BudgetAllocated - project.BudgetConsumed, 0),
            totalTasks,
            completedTasks,
            totalHoursLogged
        );
    }
}
