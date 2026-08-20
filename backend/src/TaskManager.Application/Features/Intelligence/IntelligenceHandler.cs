using MediatR;
using TaskManager.Application.Common.Exceptions;
using TaskManager.Application.DTOs;
using TaskManager.Application.Interfaces;
using TaskManager.Domain.Entities.Execution;
using TaskManager.Domain.Entities.Intelligence;
using TaskManager.Domain.Entities.Workforce;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Features.Intelligence;

public record GetCapacityHeatmapQuery(DateOnly StartDate, DateOnly EndDate) : IRequest<IReadOnlyList<CapacitySnapshotDto>>;
public record GetAiDecisionsQuery(Guid? TargetEntityId = null) : IRequest<IReadOnlyList<AiDecisionLedgerDto>>;
public record ReviewAiDecisionCommand(Guid DecisionId, bool Approve, string? ReviewNotes) : IRequest<AiDecisionLedgerDto>;
public record ManualAssignEscalatedDecisionCommand(Guid DecisionId, Guid AssigneeId, string? Notes) : IRequest<AiDecisionLedgerDto>;
public record ResolveBlockerQuery(string Question) : IRequest<ResolveBlockerResponse>;

public class IntelligenceHandler :
    IRequestHandler<GetCapacityHeatmapQuery, IReadOnlyList<CapacitySnapshotDto>>,
    IRequestHandler<GetAiDecisionsQuery, IReadOnlyList<AiDecisionLedgerDto>>,
    IRequestHandler<ReviewAiDecisionCommand, AiDecisionLedgerDto>,
    IRequestHandler<ManualAssignEscalatedDecisionCommand, AiDecisionLedgerDto>,
    IRequestHandler<ResolveBlockerQuery, ResolveBlockerResponse>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICapacityCalculator _capacityCalculator;
    private readonly IAiEmbeddingService _aiEmbeddingService;
    private readonly ITenantService _tenantService;

    public IntelligenceHandler(
        IUnitOfWork unitOfWork,
        ICapacityCalculator capacityCalculator,
        IAiEmbeddingService aiEmbeddingService,
        ITenantService tenantService)
    {
        _unitOfWork = unitOfWork;
        _capacityCalculator = capacityCalculator;
        _aiEmbeddingService = aiEmbeddingService;
        _tenantService = tenantService;
    }

    public async Task<IReadOnlyList<CapacitySnapshotDto>> Handle(GetCapacityHeatmapQuery request, CancellationToken cancellationToken)
    {
        var snapshots = await _capacityCalculator.CalculateForTeamAsync(request.StartDate, request.EndDate, cancellationToken);
        var userRepo = _unitOfWork.Repository<User>();
        var users = (await userRepo.GetAllAsync(cancellationToken)).ToDictionary(u => u.Id, u => u.FullName ?? u.Username);

        return snapshots.Select(s => new CapacitySnapshotDto(
            s.Id,
            s.UserId,
            users.TryGetValue(s.UserId, out var name) ? name : null,
            s.Date,
            s.AvailableHours,
            s.AllocatedHours,
            s.LoggedHours,
            s.UtilizationPercent,
            s.FreeHours,
            s.HeatStatus,
            s.LastCalculatedAtUtc
        )).ToList();
    }

    public async Task<IReadOnlyList<AiDecisionLedgerDto>> Handle(GetAiDecisionsQuery request, CancellationToken cancellationToken)
    {
        var ledgerRepo = _unitOfWork.Repository<AiDecisionLedger>();

        var decisions = await ledgerRepo.FindAsync(
            d => !request.TargetEntityId.HasValue || d.TargetEntityId == request.TargetEntityId.Value,
            cancellationToken);

        return decisions.Select(d => new AiDecisionLedgerDto(
            d.Id,
            d.AgentType,
            d.TargetEntityType,
            d.TargetEntityId,
            d.Action,
            d.ContextSnapshot,
            d.ReasoningChain,
            d.ConfidenceScore,
            d.Status,
            d.ReviewedByUserId,
            d.ReviewNotes,
            d.ModelVersion,
            d.ExecutionTimeMs,
            d.CreatedAtUtc,
            d.RejectionCount
        )).ToList();
    }

    public async Task<AiDecisionLedgerDto> Handle(ReviewAiDecisionCommand request, CancellationToken cancellationToken)
    {
        var ledgerRepo = _unitOfWork.Repository<AiDecisionLedger>();
        var decision = await ledgerRepo.GetByIdAsync(request.DecisionId, cancellationToken)
            ?? throw new NotFoundException(nameof(AiDecisionLedger), request.DecisionId);

        var currentUserIdStr = _tenantService.GetCurrentUserId();
        Guid? reviewerId = Guid.TryParse(currentUserIdStr, out var rId) ? rId : null;

        if (request.Approve)
        {
            decision.Approve(reviewerId ?? Guid.Empty, request.ReviewNotes);
        }
        else
        {
            decision.Reject(reviewerId ?? Guid.Empty, request.ReviewNotes);
        }

        ledgerRepo.Update(decision);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new AiDecisionLedgerDto(
            decision.Id,
            decision.AgentType,
            decision.TargetEntityType,
            decision.TargetEntityId,
            decision.Action,
            decision.ContextSnapshot,
            decision.ReasoningChain,
            decision.ConfidenceScore,
            decision.Status,
            decision.ReviewedByUserId,
            decision.ReviewNotes,
            decision.ModelVersion,
            decision.ExecutionTimeMs,
            decision.CreatedAtUtc,
            decision.RejectionCount
        );
    }

    public async Task<AiDecisionLedgerDto> Handle(ManualAssignEscalatedDecisionCommand request, CancellationToken cancellationToken)
    {
        var ledgerRepo = _unitOfWork.Repository<AiDecisionLedger>();
        var decision = await ledgerRepo.GetByIdAsync(request.DecisionId, cancellationToken)
            ?? throw new NotFoundException(nameof(AiDecisionLedger), request.DecisionId);

        if (decision.Status != Domain.Enums.AiDecisionStatus.Escalated)
        {
            throw new InvalidOperationException($"Decision {request.DecisionId} is in '{decision.Status}' status. Only 'Escalated' decisions can be manually assigned via override.");
        }

        // Apply task assignment mutation if target is TaskItem
        if (string.Equals(decision.TargetEntityType, "TaskItem", StringComparison.OrdinalIgnoreCase))
        {
            var taskRepo = _unitOfWork.Repository<TaskItem>();
            var task = await taskRepo.GetByIdAsync(decision.TargetEntityId, cancellationToken)
                ?? throw new NotFoundException(nameof(TaskItem), decision.TargetEntityId);

            task.Assign(request.AssigneeId);
            taskRepo.Update(task);
        }

        var currentUserIdStr = _tenantService.GetCurrentUserId();
        Guid? reviewerId = Guid.TryParse(currentUserIdStr, out var rId) ? rId : null;

        decision.ManualOverride(reviewerId ?? Guid.Empty, request.AssigneeId, request.Notes);
        ledgerRepo.Update(decision);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new AiDecisionLedgerDto(
            decision.Id,
            decision.AgentType,
            decision.TargetEntityType,
            decision.TargetEntityId,
            decision.Action,
            decision.ContextSnapshot,
            decision.ReasoningChain,
            decision.ConfidenceScore,
            decision.Status,
            decision.ReviewedByUserId,
            decision.ReviewNotes,
            decision.ModelVersion,
            decision.ExecutionTimeMs,
            decision.CreatedAtUtc,
            decision.RejectionCount
        );
    }

    public async Task<ResolveBlockerResponse> Handle(ResolveBlockerQuery request, CancellationToken cancellationToken)
    {
        var answer = await _aiEmbeddingService.ResolveBlockerAsync(request.Question, cancellationToken);
        return new ResolveBlockerResponse(answer);
    }
}
