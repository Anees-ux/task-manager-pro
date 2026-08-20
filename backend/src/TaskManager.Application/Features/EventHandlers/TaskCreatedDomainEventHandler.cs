using System.Text.Json;
using MediatR;
using Microsoft.Extensions.Logging;
using TaskManager.Application.Interfaces;
using TaskManager.Domain.Entities.Execution;
using TaskManager.Domain.Entities.Intelligence;
using TaskManager.Domain.Entities.Workforce;
using TaskManager.Domain.Entities.Workspace;
using TaskManager.Domain.Enums;
using TaskManager.Domain.Events;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Features.EventHandlers;

/// <summary>
/// Domain Event Handler for Autonomous Task Auto-Assignment and Neural Decision Ledger.
/// When a task is created, checks tenant AI governance settings, consults Gemini TaskRouter,
/// logs an auditable decision to AiDecisionLedger, and conditionally applies the assignment.
/// </summary>
public class TaskCreatedDomainEventHandler : INotificationHandler<TaskCreatedEvent>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IGeminiTaskRouterService _taskRouterService;
    private readonly ILogger<TaskCreatedDomainEventHandler> _logger;

    public TaskCreatedDomainEventHandler(
        IUnitOfWork unitOfWork,
        IGeminiTaskRouterService taskRouterService,
        ILogger<TaskCreatedDomainEventHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _taskRouterService = taskRouterService;
        _logger = logger;
    }

    public async Task Handle(TaskCreatedEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation("[AI AUTO-ASSIGN] Checking AI governance settings for Tenant {TenantId} on Task {TaskId}...",
            notification.TenantId, notification.TaskId);

        try
        {
            var settingsRepo = _unitOfWork.Repository<TenantSettings>();
            var settings = await settingsRepo.FirstOrDefaultAsync(
                s => s.TenantRefId == notification.TenantId, cancellationToken);

            // 1. Check if AI Auto-Assignment is enabled for this tenant
            if (settings != null && !settings.AiAutoAssignEnabled)
            {
                _logger.LogInformation("[AI AUTO-ASSIGN] Skipped: AI Auto-Assignment is disabled in tenant settings.");
                return;
            }

            var taskRepo = _unitOfWork.Repository<TaskItem>();
            var task = await taskRepo.GetByIdAsync(notification.TaskId, cancellationToken);
            if (task == null)
            {
                _logger.LogWarning("[AI AUTO-ASSIGN] Task {TaskId} was not found.", notification.TaskId);
                return;
            }

            // If task was already explicitly assigned by user during creation, skip auto-routing
            if (task.AssigneeId.HasValue && task.AssigneeId.Value != Guid.Empty)
            {
                _logger.LogInformation("[AI AUTO-ASSIGN] Skipped: Task {TaskId} already has explicit assignee {AssigneeId}.",
                    task.Id, task.AssigneeId.Value);
                return;
            }

            // 2. Fetch candidate workforce engineers and their skill matrices
            var userRepo = _unitOfWork.Repository<User>();
            var skillRepo = _unitOfWork.Repository<UserSkill>();

            var users = await userRepo.FindAsync(
                u => u.TenantId == notification.TenantId && u.IsActive, cancellationToken);

            if (users.Count == 0)
            {
                _logger.LogWarning("[AI AUTO-ASSIGN] No active users found in tenant {TenantId} to assign.", notification.TenantId);
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

            // 3. Invoke Gemini Task Router
            var decision = await _taskRouterService.RouteTaskAsync(
                title: task.Title,
                description: task.Description,
                requiredSkills: task.RequiredSkills,
                estimatedHours: task.EstimatedHours,
                candidates: candidates,
                cancellationToken: cancellationToken
            );

            // 4. Construct Context Snapshot for Explainability
            var contextSnapshot = JsonSerializer.Serialize(new
            {
                recommendedUserId = decision.RecommendedAssigneeId,
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

            // 5. Create Neural Decision Ledger Record
            var ledgerRepo = _unitOfWork.Repository<AiDecisionLedger>();
            var decisionLedger = AiDecisionLedger.Create(
                tenantId: notification.TenantId,
                agentType: AiAgentType.TaskRouter,
                targetEntityType: "TaskItem",
                targetEntityId: task.Id,
                action: AiDecisionAction.Assign,
                contextSnapshot: contextSnapshot,
                reasoningChain: decision.ReasoningChain,
                confidenceScore: decision.ConfidenceScore,
                modelVersion: decision.ModelVersion,
                executionTimeMs: decision.ExecutionTimeMs
            );

            // 6. Apply Governance Rules (RequireApproval vs AutoApply)
            var approvalMode = settings?.AiApprovalMode ?? AiApprovalMode.RequireApproval;
            var threshold = (float)(settings?.AiConfidenceThreshold ?? 0.85m);

            if (approvalMode == AiApprovalMode.AutoApply &&
                decision.ConfidenceScore >= threshold &&
                decision.RecommendedAssigneeId.HasValue)
            {
                // Auto-Apply assignment directly to the domain entity
                task.Assign(decision.RecommendedAssigneeId.Value);
                taskRepo.Update(task);

                // Mark ledger status as AutoApplied
                decisionLedger.MarkAutoApplied();

                _logger.LogInformation(
                    "[AI AUTO-ASSIGN] Auto-applied Task {TaskId} assignment to User {UserId} (Confidence: {Score:P0} >= {Threshold:P0}).",
                    task.Id, decision.RecommendedAssigneeId.Value, decision.ConfidenceScore, threshold);
            }
            else
            {
                // Stays in Proposed / Pending status for Human-in-the-Loop review
                _logger.LogInformation(
                    "[AI AUTO-ASSIGN] Decision recorded in Ledger as Pending review (ApprovalMode: {Mode}, Score: {Score:P0}, Threshold: {Threshold:P0}).",
                    approvalMode, decision.ConfidenceScore, threshold);
            }

            await ledgerRepo.AddAsync(decisionLedger, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            // Resilient execution: External AI errors must never fail the underlying task creation
            _logger.LogError(ex, "[AI AUTO-ASSIGN] Exception during AI task routing for Task {TaskId}.", notification.TaskId);
        }
    }
}
