namespace TaskManager.Domain.Entities.Common;

/// <summary>
/// Transactional Outbox entity for reliable domain event dispatching.
/// Stored in the same database transaction as business state changes to guarantee atomicity and eventual consistency.
/// </summary>
public class OutboxMessage
{
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>Fully qualified event type name, e.g. "TaskManager.Domain.Events.AiDecisionApprovedEvent".</summary>
    public string Type { get; set; } = string.Empty;

    /// <summary>JSON serialized domain event payload.</summary>
    public string Content { get; set; } = string.Empty;

    /// <summary>Timestamp when the domain event occurred.</summary>
    public DateTime OccurredOnUtc { get; set; } = DateTime.UtcNow;

    /// <summary>Timestamp when the outbox message was dispatched and processed (null if pending).</summary>
    public DateTime? ProcessedOnUtc { get; set; }

    /// <summary>Error message if domain event publishing failed.</summary>
    public string? Error { get; set; }
}
