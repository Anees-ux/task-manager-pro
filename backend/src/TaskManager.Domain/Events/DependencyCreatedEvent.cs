using TaskManager.Domain.Common;
using TaskManager.Domain.Enums;

namespace TaskManager.Domain.Events;

/// <summary>
/// Raised when a task dependency link is created.
/// Consumed by: Ripple effect graph builder, circular dependency validator.
/// </summary>
public sealed class DependencyCreatedEvent : IDomainEvent
{
    public Guid EventId { get; } = Guid.NewGuid();
    public DateTime OccurredAtUtc { get; } = DateTime.UtcNow;

    public Guid DependencyId { get; }
    public Guid PredecessorTaskId { get; }
    public Guid SuccessorTaskId { get; }
    public DependencyType Type { get; }

    public DependencyCreatedEvent(Guid dependencyId, Guid predecessorTaskId, Guid successorTaskId, DependencyType type)
    {
        DependencyId = dependencyId;
        PredecessorTaskId = predecessorTaskId;
        SuccessorTaskId = successorTaskId;
        Type = type;
    }
}
