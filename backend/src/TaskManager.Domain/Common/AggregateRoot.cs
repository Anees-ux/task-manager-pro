namespace TaskManager.Domain.Common;

/// <summary>
/// Marker base class for DDD Aggregate Roots.
/// Rules:
///   1. Only aggregate roots can be fetched directly from repositories.
///   2. All modifications to child entities go through the aggregate root.
///   3. Each aggregate root defines a transactional consistency boundary.
/// </summary>
public abstract class AggregateRoot : BaseEntity
{
    /// <summary>
    /// Incremented on every save to detect concurrency conflicts.
    /// EF Core uses this as a concurrency token via [ConcurrencyCheck].
    /// </summary>
    public int Version { get; protected set; }

    /// <summary>
    /// Called by the DbContext to increment the version on save.
    /// </summary>
    public void IncrementVersion() => Version++;
}
