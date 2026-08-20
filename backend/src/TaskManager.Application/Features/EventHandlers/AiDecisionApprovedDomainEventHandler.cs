using System.Text.Json;
using MediatR;
using Microsoft.Extensions.Logging;
using TaskManager.Domain.Entities.Execution;
using TaskManager.Domain.Entities.Workforce;
using TaskManager.Domain.Enums;
using TaskManager.Domain.Events;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Features.EventHandlers;

/// <summary>
/// Domain Event Handler that listens for AiDecisionApprovedEvent.
/// Decouples ledger approval from domain entity mutations (e.g., Task assignment).
/// Follows Event-Driven DDD principles and Single Responsibility Principle (SRP).
/// </summary>
public sealed class AiDecisionApprovedDomainEventHandler : INotificationHandler<AiDecisionApprovedEvent>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<AiDecisionApprovedDomainEventHandler> _logger;

    public AiDecisionApprovedDomainEventHandler(
        IUnitOfWork unitOfWork,
        ILogger<AiDecisionApprovedDomainEventHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task Handle(AiDecisionApprovedEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "[AI DECISION APPROVED] Processing approved AI decision {DecisionId} for entity {EntityType} ({EntityId})...",
            notification.DecisionId, notification.TargetEntityType, notification.TargetEntityId);

        // 1. Check if the affected entity is a TaskItem
        if (!string.Equals(notification.TargetEntityType, "TaskItem", StringComparison.OrdinalIgnoreCase))
        {
            _logger.LogInformation(
                "[AI DECISION APPROVED] Decision {DecisionId} target entity {EntityType} is not a TaskItem. Skipping task assignment.",
                notification.DecisionId, notification.TargetEntityType);
            return;
        }

        try
        {
            var taskRepo = _unitOfWork.Repository<TaskItem>();
            var task = await taskRepo.GetByIdAsync(notification.TargetEntityId, cancellationToken);

            if (task == null)
            {
                _logger.LogWarning(
                    "[AI DECISION APPROVED] Target TaskItem {TaskId} not found for Decision {DecisionId}.",
                    notification.TargetEntityId, notification.DecisionId);
                return;
            }

            // 2. Extract Recommended Assignee ID from ContextSnapshot or candidate metadata
            var assigneeId = await ResolveRecommendedAssigneeIdAsync(notification, cancellationToken);

            if (!assigneeId.HasValue || assigneeId.Value == Guid.Empty)
            {
                _logger.LogWarning(
                    "[AI DECISION APPROVED] Could not resolve a valid AssigneeId from ContextSnapshot for Task {TaskId}.",
                    task.Id);
                return;
            }

            // 3. Mutate domain aggregate (raises TaskAssignedEvent for capacity recalculations)
            task.Assign(assigneeId.Value);
            taskRepo.Update(task);

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "[AI DECISION APPROVED] Successfully applied assignment of Task {TaskId} ({TaskCode}) to User {AssigneeId}.",
                task.Id, task.TaskCode, assigneeId.Value);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "[AI DECISION APPROVED] Error applying approved decision {DecisionId} to Task {TaskId}.",
                notification.DecisionId, notification.TargetEntityId);
            throw;
        }
    }

    private async Task<Guid?> ResolveRecommendedAssigneeIdAsync(
        AiDecisionApprovedEvent notification,
        CancellationToken cancellationToken)
    {
        // 1. Try extracting from ContextSnapshot JSON
        if (!string.IsNullOrWhiteSpace(notification.ContextSnapshot))
        {
            try
            {
                using var doc = JsonDocument.Parse(notification.ContextSnapshot);
                var root = doc.RootElement;

                // Direct property matches
                if (root.TryGetProperty("recommendedUserId", out var recProp) && recProp.ValueKind == JsonValueKind.String)
                {
                    if (Guid.TryParse(recProp.GetString(), out var g) && g != Guid.Empty) return g;
                }
                if (root.TryGetProperty("recommendedAssigneeId", out var recProp2) && recProp2.ValueKind == JsonValueKind.String)
                {
                    if (Guid.TryParse(recProp2.GetString(), out var g) && g != Guid.Empty) return g;
                }
                if (root.TryGetProperty("assigneeId", out var recProp3) && recProp3.ValueKind == JsonValueKind.String)
                {
                    if (Guid.TryParse(recProp3.GetString(), out var g) && g != Guid.Empty) return g;
                }

                // Check candidate list in ContextSnapshot and match with reasoning chain
                if (root.TryGetProperty("candidates", out var candidatesProp) && candidatesProp.ValueKind == JsonValueKind.Array)
                {
                    var candidateList = new List<(Guid Id, string Name)>();
                    foreach (var elem in candidatesProp.EnumerateArray())
                    {
                        string? idStr = null;
                        if (elem.TryGetProperty("id", out var idElem)) idStr = idElem.GetString();
                        else if (elem.TryGetProperty("userId", out var uIdElem)) idStr = uIdElem.GetString();

                        string name = "";
                        if (elem.TryGetProperty("name", out var nElem)) name = nElem.GetString() ?? "";
                        else if (elem.TryGetProperty("fullName", out var fnElem)) name = fnElem.GetString() ?? "";

                        if (Guid.TryParse(idStr, out var cGuid) && cGuid != Guid.Empty)
                        {
                            candidateList.Add((cGuid, name));
                        }
                    }

                    // Match candidate name in reasoning chain
                    if (!string.IsNullOrWhiteSpace(notification.ReasoningChain))
                    {
                        var matched = candidateList.FirstOrDefault(c =>
                            !string.IsNullOrWhiteSpace(c.Name) &&
                            notification.ReasoningChain.Contains(c.Name, StringComparison.OrdinalIgnoreCase));

                        if (matched.Id != Guid.Empty) return matched.Id;
                    }

                    if (candidateList.Count > 0)
                    {
                        return candidateList[0].Id;
                    }
                }
            }
            catch (JsonException ex)
            {
                _logger.LogWarning(ex, "[AI DECISION APPROVED] Failed to parse ContextSnapshot JSON for Decision {DecisionId}.", notification.DecisionId);
            }
        }

        // 2. Fallback: match candidate names from reasoning chain against all active users in the tenant
        var userRepo = _unitOfWork.Repository<User>();
        var users = await userRepo.FindAsync(u => u.TenantId == notification.TenantId && u.IsActive, cancellationToken);
        if (!string.IsNullOrWhiteSpace(notification.ReasoningChain))
        {
            var matchedUser = users.FirstOrDefault(u =>
                (!string.IsNullOrWhiteSpace(u.FullName) && notification.ReasoningChain.Contains(u.FullName, StringComparison.OrdinalIgnoreCase)) ||
                (!string.IsNullOrWhiteSpace(u.Username) && notification.ReasoningChain.Contains(u.Username, StringComparison.OrdinalIgnoreCase)));

            if (matchedUser != null) return matchedUser.Id;
        }

        // 3. Fallback: first active user in the tenant
        return users.FirstOrDefault()?.Id;
    }
}
