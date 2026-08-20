using MediatR;
using TaskManager.Application.DTOs;
using TaskManager.Application.Interfaces;
using TaskManager.Domain.Entities.Financials;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Features.Projects.Commands.CreateProject;

public record CreateProjectCommand(
    string Name,
    string? Description,
    string ProjectCode,
    decimal BudgetAllocated = 0,
    DateTime? StartDate = null,
    DateTime? DeadlineUtc = null,
    Guid? ProjectManagerId = null
) : IRequest<ProjectDto>;

public class CreateProjectHandler : IRequestHandler<CreateProjectCommand, ProjectDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITenantService _tenantService;

    public CreateProjectHandler(IUnitOfWork unitOfWork, ITenantService tenantService)
    {
        _unitOfWork = unitOfWork;
        _tenantService = tenantService;
    }

    public async Task<ProjectDto> Handle(CreateProjectCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        var projectRepo = _unitOfWork.Repository<Project>();

        var existingCode = await projectRepo.AnyAsync(
            p => p.ProjectCode == request.ProjectCode, cancellationToken);

        if (existingCode)
        {
            throw new Common.Exceptions.ValidationException(
                new[] { new FluentValidation.Results.ValidationFailure("ProjectCode", $"Project code '{request.ProjectCode}' already exists.") });
        }

        var project = Project.Create(
            tenantId,
            request.Name,
            request.Description,
            request.ProjectCode,
            request.BudgetAllocated);

        if (request.StartDate.HasValue) project.SetStartDate(request.StartDate);
        if (request.DeadlineUtc.HasValue) project.SetDeadline(request.DeadlineUtc);
        if (request.ProjectManagerId.HasValue) project.AssignProjectManager(request.ProjectManagerId.Value);

        await projectRepo.AddAsync(project, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

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
            0
        );
    }
}
