using MediatR;
using Microsoft.Extensions.Logging;
using TaskManager.Application.Interfaces;
using TaskManager.Domain.Entities.Execution;
using TaskManager.Domain.Entities.Intelligence;
using TaskManager.Domain.Events;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Features.EventHandlers;

public class DomainEventHandlers :
    INotificationHandler<TaskAssignedEvent>,
    INotificationHandler<WorkLogCreatedEvent>,
    INotificationHandler<TaskDeadlineShiftedEvent>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICapacityCalculator _capacityCalculator;
    private readonly ILogger<DomainEventHandlers> _logger;

    public DomainEventHandlers(
        IUnitOfWork unitOfWork,
        ICapacityCalculator capacityCalculator,
        ILogger<DomainEventHandlers> logger)
    {
        _unitOfWork = unitOfWork;
        _capacityCalculator = capacityCalculator;
        _logger = logger;
    }

    public async Task Handle(TaskAssignedEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation("[EVENT] TaskAssigned: Task {TaskId} assigned to {NewAssigneeId}",
            notification.TaskId, notification.NewAssigneeId);

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        if (notification.NewAssigneeId != Guid.Empty)
        {
            await _capacityCalculator.RecalculateAndPersistAsync(notification.NewAssigneeId, today, cancellationToken);
        }

        if (notification.PreviousAssigneeId.HasValue && notification.PreviousAssigneeId.Value != Guid.Empty)
        {
            await _capacityCalculator.RecalculateAndPersistAsync(notification.PreviousAssigneeId.Value, today, cancellationToken);
        }
    }

    public async Task Handle(WorkLogCreatedEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation("[EVENT] WorkLogCreated: User {UserId} logged {Hours}h on Task {TaskId}",
            notification.UserId, notification.HoursWorked, notification.TaskId);

        await _capacityCalculator.RecalculateAndPersistAsync(notification.UserId, notification.LogDate, cancellationToken);
    }

    public async Task Handle(TaskDeadlineShiftedEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation("[EVENT] TaskDeadlineShifted: Task {TaskId} shifted from {Prev} to {New}. Reason: {Reason}",
            notification.TaskId, notification.PreviousDeadlineUtc, notification.NewDeadlineUtc, notification.Reason);

        // Analyze downstream dependencies
        var depRepo = _unitOfWork.Repository<TaskDependency>();
        var taskRepo = _unitOfWork.Repository<TaskItem>();
        var rippleRepo = _unitOfWork.Repository<RippleEffectLog>();

        var successors = await depRepo.FindAsync(d => d.PredecessorTaskId == notification.TaskId, cancellationToken);
        if (successors.Count > 0)
        {
            var task = await taskRepo.GetByIdAsync(notification.TaskId, cancellationToken);
            var tenantId = task?.TenantId ?? Guid.Empty;

            var affectedTasksInfo = successors.Select(s => new
            {
                SuccessorTaskId = s.SuccessorTaskId,
                s.Type,
                s.LagDays,
                ImpactedBy = notification.TaskId
            });

            var rippleLog = RippleEffectLog.Create(
                tenantId,
                notification.TaskId,
                "DeadlineShifted",
                System.Text.Json.JsonSerializer.Serialize(affectedTasksInfo),
                successors.Count
            );

            await rippleRepo.AddAsync(rippleLog, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
