using TaskManager.Domain.Common;
using TaskManager.Domain.Enums;

namespace TaskManager.Domain.Events;

/// <summary>
/// Domain Event raised when an autonomous AI decision is rejected by a human reviewer.
/// Triggers the AI Feedback Loop for re-evaluation or escalation after 3 rejections.
/// </summary>
public sealed class AiDecisionRejectedEvent : IDomainEvent
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
    public int RejectionCount { get; }
    public string? Reason { get; }
    public Guid ReviewedByUserId { get; }
    public bool IsEscalated { get; }

    public AiDecisionRejectedEvent(
        Guid decisionId,
        Guid tenantId,
        AiAgentType agentType,
        string targetEntityType,
        Guid targetEntityId,
        AiDecisionAction action,
        string contextSnapshot,
        string reasoningChain,
        int rejectionCount,
        string? reason,
        Guid reviewedByUserId,
        bool isEscalated)
    {
        DecisionId = decisionId;
        TenantId = tenantId;
        AgentType = agentType;
        TargetEntityType = targetEntityType;
        TargetEntityId = targetEntityId;
        Action = action;
        ContextSnapshot = contextSnapshot;
        ReasoningChain = reasoningChain;
        RejectionCount = rejectionCount;
        Reason = reason;
        ReviewedByUserId = reviewedByUserId;
        IsEscalated = isEscalated;
    }
}
