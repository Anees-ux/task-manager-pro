using MediatR;
using TaskManager.Application.Common.Exceptions;
using TaskManager.Application.DTOs;
using TaskManager.Application.Interfaces;
using TaskManager.Domain.Entities.Execution;
using TaskManager.Domain.Entities.Financials;
using TaskManager.Domain.Entities.Workforce;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Features.Tasks.Commands.WorkLogs;

public record LogWorkCommand(
    Guid TaskId,
    DateOnly LogDate,
    decimal HoursWorked,
    string? Description
) : IRequest<WorkLogDto>;

public record GetTaskWorkLogsQuery(Guid? TaskId = null, Guid? UserId = null) : IRequest<IReadOnlyList<WorkLogDto>>;

public class WorkLogsHandler :
    IRequestHandler<LogWorkCommand, WorkLogDto>,
    IRequestHandler<GetTaskWorkLogsQuery, IReadOnlyList<WorkLogDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITenantService _tenantService;

    public WorkLogsHandler(IUnitOfWork unitOfWork, ITenantService tenantService)
    {
        _unitOfWork = unitOfWork;
        _tenantService = tenantService;
    }

    public async Task<WorkLogDto> Handle(LogWorkCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        var currentUserIdStr = _tenantService.GetCurrentUserId();

        if (!Guid.TryParse(currentUserIdStr, out var currentUserId))
        {
            throw new UnauthorizedAccessException("User identification required to log work.");
        }

        var taskRepo = _unitOfWork.Repository<TaskItem>();
        var userRepo = _unitOfWork.Repository<User>();
        var workLogRepo = _unitOfWork.Repository<WorkLog>();
        var projectRepo = _unitOfWork.Repository<Project>();

        var task = await taskRepo.GetByIdAsync(request.TaskId, cancellationToken)
            ?? throw new NotFoundException(nameof(TaskItem), request.TaskId);

        var user = await userRepo.GetByIdAsync(currentUserId, cancellationToken)
            ?? throw new NotFoundException(nameof(User), currentUserId);

        var workLog = WorkLog.Create(tenantId, task.Id, user.Id, request.LogDate, request.HoursWorked, request.Description);
        await workLogRepo.AddAsync(workLog, cancellationToken);

        // Update task actual hours
        task.AddActualHours(request.HoursWorked);
        taskRepo.Update(task);

        // Update project budget consumed (HoursWorked * User.HourlyRate)
        var project = await projectRepo.GetByIdAsync(task.ProjectId, cancellationToken);
        if (project != null && user.HourlyRate > 0)
        {
            var cost = request.HoursWorked * user.HourlyRate;
            project.AddBudgetConsumed(cost);
            projectRepo.Update(project);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new WorkLogDto(
            workLog.Id,
            task.Id,
            task.Title,
            task.TaskCode,
            user.Id,
            user.FullName ?? user.Username,
            workLog.LogDate,
            workLog.HoursWorked,
            workLog.Description,
            workLog.CreatedAtUtc
        );
    }

    public async Task<IReadOnlyList<WorkLogDto>> Handle(GetTaskWorkLogsQuery request, CancellationToken cancellationToken)
    {
        var workLogRepo = _unitOfWork.Repository<WorkLog>();
        var taskRepo = _unitOfWork.Repository<TaskItem>();
        var userRepo = _unitOfWork.Repository<User>();

        var logs = await workLogRepo.FindAsync(w =>
            (!request.TaskId.HasValue || w.TaskId == request.TaskId.Value) &&
            (!request.UserId.HasValue || w.UserId == request.UserId.Value),
            cancellationToken);

        var tasks = (await taskRepo.GetAllAsync(cancellationToken)).ToDictionary(t => t.Id);
        var users = (await userRepo.GetAllAsync(cancellationToken)).ToDictionary(u => u.Id);

        return logs.Select(w =>
        {
            tasks.TryGetValue(w.TaskId, out var task);
            users.TryGetValue(w.UserId, out var user);

            return new WorkLogDto(
                w.Id,
                w.TaskId,
                task?.Title ?? "Unknown Task",
                task?.TaskCode ?? "UNK",
                w.UserId,
                user?.FullName ?? user?.Username ?? "Unknown User",
                w.LogDate,
                w.HoursWorked,
                w.Description,
                w.CreatedAtUtc
            );
        }).ToList();
    }
}
