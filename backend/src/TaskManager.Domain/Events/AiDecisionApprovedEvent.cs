using TaskManager.Domain.Common;
using TaskManager.Domain.Enums;

namespace TaskManager.Domain.Events;

/// <summary>
/// Domain Event raised when an autonomous AI decision is reviewed and approved by a human or governance rule.
/// Consumed by domain event handlers to execute decoupled domain side effects (e.g. assigning TaskItem).
/// </summary>
public sealed class AiDecisionApprovedEvent : IDomainEvent
{
    public Guid EventId { get; } = Guid.NewGuid();
    public DateTime OccurredAtUtc { get; } = DateTime.UtcNow;

    public Guid DecisionId { get; }
    public Guid TenantId { get; }
    public AiAgentType AgentType { get; }
    public string TargetEntityType { get; }
    public Guid TargetEntityId { get; }
    public AiDecisionAction Action { get; }
    public string ContextSnapshot { get; }
    public string ReasoningChain { get; }
    public float ConfidenceScore { get; }
    public Guid ReviewedByUserId { get; }
    public string? ReviewNotes { get; }

    public AiDecisionApprovedEvent(
        Guid decisionId,
        Guid tenantId,
        AiAgentType agentType,
        string targetEntityType,
        Guid targetEntityId,
        AiDecisionAction action,
        string contextSnapshot,
        string reasoningChain,
        float confidenceScore,
        Guid reviewedByUserId,
        string? reviewNotes = null)
    {
        DecisionId = decisionId;
        TenantId = tenantId;
        AgentType = agentType;
        TargetEntityType = targetEntityType;
        TargetEntityId = targetEntityId;
        Action = action;
        ContextSnapshot = contextSnapshot;
        ReasoningChain = reasoningChain;
        ConfidenceScore = confidenceScore;
        ReviewedByUserId = reviewedByUserId;
        ReviewNotes = reviewNotes;
    }
}
