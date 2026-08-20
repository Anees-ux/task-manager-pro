using TaskManager.Domain.Entities.Intelligence;

namespace TaskManager.Application.Interfaces;

/// <summary>
/// Contract for the Capacity Heatmap Engine.
/// Calculates and materializes workforce capacity snapshots.
/// </summary>
public interface ICapacityCalculator
{
    /// <summary>Calculates capacity for a single user on a specific date.</summary>
    Task<CapacitySnapshot> CalculateForUserAsync(Guid userId, DateOnly date, CancellationToken cancellationToken = default);

    /// <summary>Calculates capacity heatmap for an entire team over a date range.</summary>
    Task<IReadOnlyList<CapacitySnapshot>> CalculateForTeamAsync(
        DateOnly startDate,
        DateOnly endDate,
        CancellationToken cancellationToken = default);

    /// <summary>Recalculates and persists the snapshot for a user on a date (triggered by domain events).</summary>
    Task RecalculateAndPersistAsync(Guid userId, DateOnly date, CancellationToken cancellationToken = default);
}
