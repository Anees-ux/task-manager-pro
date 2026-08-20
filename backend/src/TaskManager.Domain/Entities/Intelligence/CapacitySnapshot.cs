using TaskManager.Domain.Common;
using TaskManager.Domain.Enums;

namespace TaskManager.Domain.Entities.Intelligence;

/// <summary>
/// Materialized capacity data for a single user on a single day.
/// Recalculated via domain events when tasks are assigned, work is logged, or time-off changes.
/// Powers the Capacity Heatmap Engine visualization and AI routing decisions.
/// </summary>
public class CapacitySnapshot : BaseEntity
{
    public Guid UserId { get; private set; }
    public DateOnly Date { get; private set; }

    /// <summary>Available hours = UserAvailability - TimeOffs.</summary>
    public decimal AvailableHours { get; private set; }

    /// <summary>Allocated hours = Sum of EstimatedHours from assigned tasks.</summary>
    public decimal AllocatedHours { get; private set; }

    /// <summary>Logged hours = Sum of WorkLog.HoursWorked for this date.</summary>
    public decimal LoggedHours { get; private set; }

    /// <summary>Computed heat status based on utilization percentage.</summary>
    public CapacityStatus HeatStatus { get; private set; }

    public DateTime LastCalculatedAtUtc { get; private set; }

    // ─── Private constructor for EF Core ─────────────────────────
    private CapacitySnapshot() { }

    // ─── Factory Method ──────────────────────────────────────────
    public static CapacitySnapshot Create(
        Guid tenantId,
        Guid userId,
        DateOnly date,
        decimal availableHours,
        decimal allocatedHours,
        decimal loggedHours)
    {
        var snapshot = new CapacitySnapshot
        {
            TenantId = tenantId,
            UserId = userId,
            Date = date,
            AvailableHours = availableHours,
            AllocatedHours = allocatedHours,
            LoggedHours = loggedHours,
            LastCalculatedAtUtc = DateTime.UtcNow,
        };

        snapshot.HeatStatus = snapshot.CalculateHeatStatus();
        return snapshot;
    }

    // ─── Domain Methods ──────────────────────────────────────────
    public void Recalculate(decimal availableHours, decimal allocatedHours, decimal loggedHours)
    {
        AvailableHours = availableHours;
        AllocatedHours = allocatedHours;
        LoggedHours = loggedHours;
        HeatStatus = CalculateHeatStatus();
        LastCalculatedAtUtc = DateTime.UtcNow;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    /// <summary>Utilization percentage: Allocated / Available × 100.</summary>
    public decimal UtilizationPercent =>
        AvailableHours > 0 ? Math.Round(AllocatedHours / AvailableHours * 100, 2) : 0;

    /// <summary>Remaining free capacity in hours.</summary>
    public decimal FreeHours => Math.Max(AvailableHours - AllocatedHours, 0);

    private CapacityStatus CalculateHeatStatus()
    {
        if (AvailableHours <= 0) return CapacityStatus.OnLeave;

        var utilization = AvailableHours > 0 ? AllocatedHours / AvailableHours * 100 : 0;

        return utilization switch
        {
            < 60 => CapacityStatus.Available,
            < 80 => CapacityStatus.Optimal,
            <= 100 => CapacityStatus.Warning,
            _ => CapacityStatus.Overloaded
        };
    }
}
