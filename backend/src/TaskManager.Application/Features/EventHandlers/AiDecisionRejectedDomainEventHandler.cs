using System.Text.Json;
using MediatR;
using Microsoft.Extensions.Logging;
using TaskManager.Application.Interfaces;
using TaskManager.Domain.Entities.Execution;
using TaskManager.Domain.Entities.Intelligence;
using TaskManager.Domain.Entities.Workforce;
using TaskManager.Domain.Events;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Features.EventHandlers;

/// <summary>
/// Domain Event Handler that listens for AiDecisionRejectedEvent.
/// Executes the Autonomous AI Feedback Loop:
/// - Attempts 1 & 2: Re-invokes Gemini TaskRouter with rejection context to suggest an alternative developer.
/// - Attempt 3+: Guardrail triggers escalation for human Tech Lead / Admin manual override.
/// </summary>
public sealed class AiDecisionRejectedDomainEventHandler : INotificationHandler<AiDecisionRejectedEvent>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IGeminiTaskRouterService _taskRouterService;
    private readonly ILogger<AiDecisionRejectedDomainEventHandler> _logger;

    public AiDecisionRejectedDomainEventHandler(
        IUnitOfWork unitOfWork,
        IGeminiTaskRouterService taskRouterService,
        ILogger<AiDecisionRejectedDomainEventHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _taskRouterService = taskRouterService;
        _logger = logger;
    }

    public async Task Handle(AiDecisionRejectedEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "[AI FEEDBACK LOOP] Processing rejected AI decision {DecisionId} (Attempt #{Count}) for {EntityType} ({EntityId}). Reason: '{Reason}'",
            notification.DecisionId, notification.RejectionCount, notification.TargetEntityType, notification.TargetEntityId, notification.Reason ?? "None provided");

        // 1. Guardrail Check: If rejected 3 times, halt auto-retry and escalate for manual admin override
        if (notification.IsEscalated || notification.RejectionCount >= 3)
        {
            _logger.LogWarning(
                "[AI FEEDBACK LOOP ESCALATION] Decision {DecisionId} for Task {TaskId} has been rejected {Count} times. Auto-routing halted; escalated for manual Tech Lead assignment.",
                notification.DecisionId, notification.TargetEntityId, notification.RejectionCount);
            return;
        }

        // 2. Only TaskItem assignments are re-routed through TaskRouter
        if (!string.Equals(notification.TargetEntityType, "TaskItem", StringComparison.OrdinalIgnoreCase))
        {
            return;
        }

        try
        {
            var taskRepo = _unitOfWork.Repository<TaskItem>();
            var task = await taskRepo.GetByIdAsync(notification.TargetEntityId, cancellationToken);
            if (task == null)
            {
                _logger.LogWarning("[AI FEEDBACK LOOP] Task {TaskId} not found for Decision {DecisionId}.", notification.TargetEntityId, notification.DecisionId);
                return;
            }

            // If task was already assigned manually in the meantime, skip auto re-evaluation
            if (task.AssigneeId.HasValue && task.AssigneeId.Value != Guid.Empty)
            {
                _logger.LogInformation("[AI FEEDBACK LOOP] Task {TaskId} was already manually assigned to {AssigneeId}. Skipping re-evaluation.", task.Id, task.AssigneeId.Value);
                return;
            }

            // 3. Fetch candidate workforce members in tenant
            var userRepo = _unitOfWork.Repository<User>();
            var skillRepo = _unitOfWork.Repository<UserSkill>();

            var users = await userRepo.FindAsync(
                u => u.TenantId == notification.TenantId && u.IsActive, cancellationToken);

            if (users.Count == 0)
            {
                _logger.LogWarning("[AI FEEDBACK LOOP] No active engineers found in tenant {TenantId} to re-evaluate.", notification.TenantId);
                return;
            }

            var allSkills = await skillRepo.FindAsync(
                s => s.TenantId == notification.TenantId, cancellationToken);

            var userSkillMap = allSkills
                .GroupBy(s => s.UserId)
                .ToDictionary(g => g.Key, g => g.Select(s => s.SkillName).ToList());

            var candidates = users.Select(u => new CandidateUserContext(
                UserId: u.Id,
                FullName: u.FullName,
                Username: u.Username,
                Role: u.Role.ToString(),
                HourlyRate: u.HourlyRate,
                Skills: userSkillMap.TryGetValue(u.Id, out var sList) ? sList : new List<string>()
            )).ToList();

            // 4. Construct Feedback Context for Gemini
            var feedbackContext = $"Previous recommendation attempt #{notification.RejectionCount} was rejected by Tech Lead. Rejection reason: \"{notification.Reason ?? "Not optimal"}\". Please evaluate other candidate engineers and recommend an alternative qualified engineer.";

            // 5. Re-invoke Gemini Task Router with Rejection Context
            var decision = await _taskRouterService.RouteTaskAsync(
                title: task.Title,
                description: task.Description,
                requiredSkills: task.RequiredSkills,
                estimatedHours: task.EstimatedHours,
                candidates: candidates,
                feedbackContext: feedbackContext,
                cancellationToken: cancellationToken
            );

            // 6. Update the existing Decision Ledger record with the alternative proposal
            var ledgerRepo = _unitOfWork.Repository<AiDecisionLedger>();
            var ledger = await ledgerRepo.GetByIdAsync(notification.DecisionId, cancellationToken);

            if (ledger == null)
            {
                _logger.LogWarning("[AI FEEDBACK LOOP] Ledger record {DecisionId} not found.", notification.DecisionId);
                return;
            }

            var updatedContextSnapshot = JsonSerializer.Serialize(new
            {
                recommendedUserId = decision.RecommendedAssigneeId,
                rejectionAttempt = notification.RejectionCount,
                previousRejectionReason = notification.Reason,
                task = new
                {
                    id = task.Id,
                    title = task.Title,
                    description = task.Description,
                    priority = task.Priority.ToString(),
                    requiredSkills = task.RequiredSkills,
                    estimatedHours = task.EstimatedHours
                },
                candidates = candidates.Select(c => new
                {
                    id = c.UserId,
                    name = c.FullName,
                    role = c.Role,
                    skills = c.Skills
                })
            });

            // Resets status to Proposed so it re-appears in the UI for Human-In-The-Loop review
            ledger.ReEvaluate(
                contextSnapshot: updatedContextSnapshot,
                reasoningChain: decision.ReasoningChain,
                confidenceScore: decision.ConfidenceScore,
                modelVersion: decision.ModelVersion,
                executionTimeMs: decision.ExecutionTimeMs
            );

            ledgerRepo.Update(ledger);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "[AI FEEDBACK LOOP] Successfully re-evaluated Decision {DecisionId} for Task {TaskId} (New Candidate: {CandidateId}, Confidence: {Score:P0}). Reset to Proposed.",
                ledger.Id, task.Id, decision.RecommendedAssigneeId, decision.ConfidenceScore);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[AI FEEDBACK LOOP] Error during feedback loop re-evaluation for Decision {DecisionId}.", notification.DecisionId);
        }
    }
}
