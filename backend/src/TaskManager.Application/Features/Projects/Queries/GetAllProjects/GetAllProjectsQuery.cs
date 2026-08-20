using MediatR;
using TaskManager.Application.DTOs;
using TaskManager.Domain.Entities.Execution;
using TaskManager.Domain.Entities.Financials;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Features.Projects.Queries.GetAllProjects;

public record GetAllProjectsQuery() : IRequest<IReadOnlyList<ProjectDto>>;

public class GetAllProjectsHandler : IRequestHandler<GetAllProjectsQuery, IReadOnlyList<ProjectDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetAllProjectsHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<ProjectDto>> Handle(GetAllProjectsQuery request, CancellationToken cancellationToken)
    {
        var projectRepo = _unitOfWork.Repository<Project>();
        var taskRepo = _unitOfWork.Repository<TaskItem>();

        var projects = await projectRepo.GetAllAsync(cancellationToken);
        var projectDtos = new List<ProjectDto>();

        foreach (var p in projects)
        {
            var taskCount = await taskRepo.CountAsync(t => t.ProjectId == p.Id, cancellationToken);
            projectDtos.Add(new ProjectDto(
                p.Id,
                p.Name,
                p.Description,
                p.ProjectCode,
                p.Status,
                p.BudgetAllocated,
                p.BudgetConsumed,
                p.BudgetUtilizationPercent,
                p.StartDate,
                p.DeadlineUtc,
                p.ProjectManagerId,
                p.CreatedAtUtc,
                taskCount
            ));
        }

        return projectDtos;
    }
}
