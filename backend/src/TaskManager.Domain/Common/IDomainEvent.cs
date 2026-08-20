using MediatR;

namespace TaskManager.Domain.Common;

/// <summary>
/// Domain Event interface extending MediatR INotification.
/// Aggregate roots raise these events to trigger side effects across bounded contexts.
/// </summary>
public interface IDomainEvent : INotification
{
    Guid EventId { get; }
    DateTime OccurredAtUtc { get; }
}
