using TaskManager.Domain.Common;
using TaskManager.Domain.Enums;

namespace TaskManager.Domain.Entities.Intelligence;

/// <summary>
/// Neural Decision Ledger — Event-sourced audit trail for AI decisions.
/// Records what the AI saw (ContextSnapshot), why it decided (ReasoningChain),
/// and how confident it was (ConfidenceScore). Enables explainability and replayability.
/// </summary>
public class AiDecisionLedger : BaseEntity
{
    /// <summary>Which AI agent made this decision.</summary>
    public AiAgentType AgentType { get; private set; }

    /// <summary>Type of entity affected, e.g. "TaskItem", "User".</summary>
    public string TargetEntityType { get; private set; } = string.Empty;

    /// <summary>ID of the entity that was affected by this decision.</summary>
    public Guid TargetEntityId { get; private set; }

    /// <summary>What action the AI proposed.</summary>
    public AiDecisionAction Action { get; private set; }

    /// <summary>JSON snapshot of all data the AI considered when making this decision.</summary>
    public string ContextSnapshot { get; private set; } = string.Empty;

    /// <summary>JSON of step-by-step AI reasoning chain.</summary>
    public string ReasoningChain { get; private set; } = string.Empty;

    /// <summary>AI confidence score (0.0 to 1.0).</summary>
    public float ConfidenceScore { get; private set; }

    /// <summary>Current lifecycle status of this decision.</summary>
    public AiDecisionStatus Status { get; private set; } = AiDecisionStatus.Proposed;

    /// <summary>User who reviewed/approved/rejected this decision.</summary>
    public Guid? ReviewedByUserId { get; private set; }

    /// <summary>Notes from the human reviewer.</summary>
    public string? ReviewNotes { get; private set; }

    /// <summary>Number of times this decision has been rejected by human reviewers.</summary>
    public int RejectionCount { get; private set; } = 0;

    /// <summary>Model version string, e.g. "gemini-3.6-flash".</summary>
    public string ModelVersion { get; private set; } = string.Empty;

    /// <summary>How long the AI took to make this decision (ms).</summary>
    public int ExecutionTimeMs { get; private set; }

    // ─── Private constructor for EF Core ─────────────────────────
    private AiDecisionLedger() { }

    // ─── Factory Method ──────────────────────────────────────────
    public static AiDecisionLedger Create(
        Guid tenantId,
        AiAgentType agentType,
        string targetEntityType,
        Guid targetEntityId,
        AiDecisionAction action,
        string contextSnapshot,
        string reasoningChain,
        float confidenceScore,
        string modelVersion,
        int executionTimeMs)
    {
        return new AiDecisionLedger
        {
            TenantId = tenantId,
            AgentType = agentType,
            TargetEntityType = targetEntityType,
            TargetEntityId = targetEntityId,
            Action = action,
            ContextSnapshot = contextSnapshot,
            ReasoningChain = reasoningChain,
            ConfidenceScore = Math.Clamp(confidenceScore, 0f, 1f),
            ModelVersion = modelVersion,
            ExecutionTimeMs = executionTimeMs,
            Status = AiDecisionStatus.Proposed,
        };
    }

    // ─── Domain Methods ──────────────────────────────────────────
    public void Approve(Guid reviewedByUserId, string? notes = null)
    {
        if (Status != AiDecisionStatus.Proposed)
            throw new InvalidOperationException($"Cannot approve a decision in '{Status}' status.");

        Status = AiDecisionStatus.Approved;
        ReviewedByUserId = reviewedByUserId;
        ReviewNotes = notes;
        UpdatedAtUtc = DateTime.UtcNow;

        AddDomainEvent(new Events.AiDecisionApprovedEvent(
            Id,
            TenantId,
            AgentType,
            TargetEntityType,
            TargetEntityId,
            Action,
            ContextSnapshot,
            ReasoningChain,
            ConfidenceScore,
            reviewedByUserId,
            notes
        ));
    }

    public void Reject(Guid reviewedByUserId, string? notes = null)
    {
        if (Status != AiDecisionStatus.Proposed)
            throw new InvalidOperationException($"Cannot reject a decision in '{Status}' status.");

        RejectionCount++;
        ReviewedByUserId = reviewedByUserId;
        ReviewNotes = notes;
        UpdatedAtUtc = DateTime.UtcNow;

        // Guardrail: 3 rejections escalate decision to human admin manual override
        if (RejectionCount >= 3)
        {
            Status = AiDecisionStatus.Escalated;
        }
        else
        {
            Status = AiDecisionStatus.Rejected;
        }

        AddDomainEvent(new Events.AiDecisionRejectedEvent(
            Id,
            TenantId,
            AgentType,
            TargetEntityType,
            TargetEntityId,
            Action,
            ContextSnapshot,
            ReasoningChain,
            RejectionCount,
            notes,
            reviewedByUserId,
            Status == AiDecisionStatus.Escalated
        ));
    }

    /// <summary>
    /// Resets the decision to Proposed status with the new AI suggestion after a feedback loop retry.
    /// </summary>
    public void ReEvaluate(
        string contextSnapshot,
        string reasoningChain,
        float confidenceScore,
        string modelVersion,
        int executionTimeMs)
    {
        ContextSnapshot = contextSnapshot;
        ReasoningChain = reasoningChain;
        ConfidenceScore = Math.Clamp(confidenceScore, 0f, 1f);
        ModelVersion = modelVersion;
        ExecutionTimeMs = executionTimeMs;
        Status = AiDecisionStatus.Proposed;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    /// <summary>
    /// Manually resolves an Escalated decision when a human administrator overrides autonomous assignment.
    /// </summary>
    public void ManualOverride(Guid reviewedByUserId, Guid assignedUserId, string? notes = null)
    {
        if (Status != AiDecisionStatus.Escalated)
            throw new InvalidOperationException($"Cannot manually override a decision in '{Status}' status. Decision must be Escalated.");

        Status = AiDecisionStatus.Approved;
        ReviewedByUserId = reviewedByUserId;
        ReviewNotes = string.IsNullOrWhiteSpace(notes)
            ? $"[Manual Override] Manually assigned to {assignedUserId} by human administrator."
            : $"[Manual Override] {notes}";
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void MarkAutoApplied()
    {
        Status = AiDecisionStatus.AutoApplied;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void MarkExpired()
    {
        if (Status == AiDecisionStatus.Proposed)
        {
            Status = AiDecisionStatus.Expired;
            UpdatedAtUtc = DateTime.UtcNow;
        }
    }
}
