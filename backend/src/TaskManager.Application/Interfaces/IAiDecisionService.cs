using TaskManager.Domain.Entities.Intelligence;
using TaskManager.Domain.Enums;

namespace TaskManager.Application.Interfaces;

/// <summary>
/// Contract for AI decision-making services.
/// Will be implemented when Gemini LLM integration begins.
/// </summary>
public interface IAiDecisionService
{
    /// <summary>
    /// AI proposes the best assignee for a task based on skills, capacity, and historical data.
    /// Returns a decision ledger entry with reasoning chain and confidence score.
    /// </summary>
    Task<AiDecisionLedger> ProposeAssignmentAsync(Guid taskId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Analyzes whether an AI decision should be auto-applied based on tenant confidence threshold.
    /// </summary>
    Task<bool> ShouldAutoApplyAsync(AiDecisionLedger decision, CancellationToken cancellationToken = default);

    /// <summary>
    /// Calculates the ripple effect of a deadline change across the dependency graph.
    /// </summary>
    Task<RippleEffectLog> CalculateRippleEffectAsync(Guid taskId, string triggerEvent, CancellationToken cancellationToken = default);
}
