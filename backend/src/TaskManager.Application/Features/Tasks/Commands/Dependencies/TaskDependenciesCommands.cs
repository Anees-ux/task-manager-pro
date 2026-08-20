using MediatR;
using TaskManager.Application.Common.Exceptions;
using TaskManager.Application.DTOs;
using TaskManager.Application.Interfaces;
using TaskManager.Domain.Entities.Execution;
using TaskManager.Domain.Enums;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Features.Tasks.Commands.Dependencies;

public record CreateTaskDependencyCommand(
    Guid PredecessorTaskId,
    Guid SuccessorTaskId,
    DependencyType Type = DependencyType.FinishToStart,
    int LagDays = 0
) : IRequest<TaskDependencyDto>;

public record DeleteTaskDependencyCommand(Guid Id) : IRequest;

public record GetTaskDependenciesQuery(Guid TaskId) : IRequest<IReadOnlyList<TaskDependencyDto>>;

public class TaskDependenciesHandler :
    IRequestHandler<CreateTaskDependencyCommand, TaskDependencyDto>,
    IRequestHandler<DeleteTaskDependencyCommand>,
    IRequestHandler<GetTaskDependenciesQuery, IReadOnlyList<TaskDependencyDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITenantService _tenantService;

    public TaskDependenciesHandler(IUnitOfWork unitOfWork, ITenantService tenantService)
    {
        _unitOfWork = unitOfWork;
        _tenantService = tenantService;
    }

    public async Task<TaskDependencyDto> Handle(CreateTaskDependencyCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        var taskRepo = _unitOfWork.Repository<TaskItem>();
        var depRepo = _unitOfWork.Repository<TaskDependency>();

        var pred = await taskRepo.GetByIdAsync(request.PredecessorTaskId, cancellationToken)
            ?? throw new NotFoundException(nameof(TaskItem), request.PredecessorTaskId);

        var succ = await taskRepo.GetByIdAsync(request.SuccessorTaskId, cancellationToken)
            ?? throw new NotFoundException(nameof(TaskItem), request.SuccessorTaskId);

        var existing = await depRepo.AnyAsync(
            d => d.PredecessorTaskId == request.PredecessorTaskId && d.SuccessorTaskId == request.SuccessorTaskId,
            cancellationToken);

        if (existing)
        {
            throw new Common.Exceptions.ValidationException(
                new[] { new FluentValidation.Results.ValidationFailure("PredecessorTaskId", "This dependency relationship already exists.") });
        }

        var dependency = TaskDependency.Create(tenantId, request.PredecessorTaskId, request.SuccessorTaskId, request.Type, request.LagDays);
        await depRepo.AddAsync(dependency, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new TaskDependencyDto(
            dependency.Id,
            pred.Id,
            pred.Title,
            pred.TaskCode,
            succ.Id,
            succ.Title,
            succ.TaskCode,
            dependency.Type,
            dependency.LagDays
        );
    }

    public async Task Handle(DeleteTaskDependencyCommand request, CancellationToken cancellationToken)
    {
        var depRepo = _unitOfWork.Repository<TaskDependency>();
        var dep = await depRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(TaskDependency), request.Id);

        depRepo.Remove(dep);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<TaskDependencyDto>> Handle(GetTaskDependenciesQuery request, CancellationToken cancellationToken)
    {
        var depRepo = _unitOfWork.Repository<TaskDependency>();
        var taskRepo = _unitOfWork.Repository<TaskItem>();

        var dependencies = await depRepo.FindAsync(
            d => d.PredecessorTaskId == request.TaskId || d.SuccessorTaskId == request.TaskId,
            cancellationToken);

        var allTasks = (await taskRepo.GetAllAsync(cancellationToken)).ToDictionary(t => t.Id);

        return dependencies.Select(d =>
        {
            allTasks.TryGetValue(d.PredecessorTaskId, out var pred);
            allTasks.TryGetValue(d.SuccessorTaskId, out var succ);

            return new TaskDependencyDto(
                d.Id,
                d.PredecessorTaskId,
                pred?.Title ?? "Unknown",
                pred?.TaskCode ?? "UNK",
                d.SuccessorTaskId,
                succ?.Title ?? "Unknown",
                succ?.TaskCode ?? "UNK",
                d.Type,
                d.LagDays
            );
        }).ToList();
    }
}
