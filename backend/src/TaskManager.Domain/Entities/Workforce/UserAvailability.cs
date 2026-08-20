using TaskManager.Domain.Common;

namespace TaskManager.Domain.Entities.Workforce;

/// <summary>
/// Defines a user's recurring weekly availability roster.
/// Used by the Capacity Heatmap Engine to calculate daily available hours.
/// </summary>
public class UserAvailability : BaseEntity
{
    public Guid UserId { get; private set; }
    public DayOfWeek DayOfWeek { get; private set; }
    public TimeOnly StartTime { get; private set; }
    public TimeOnly EndTime { get; private set; }

    /// <summary>Calculated: EndTime - StartTime in hours.</summary>
    public decimal AvailableHours { get; private set; }

    // Navigation
    public User? User { get; private set; }

    // ─── Private constructor for EF Core ─────────────────────────
    private UserAvailability() { }

    // ─── Factory Method ──────────────────────────────────────────
    public static UserAvailability Create(Guid tenantId, Guid userId, DayOfWeek dayOfWeek, TimeOnly startTime, TimeOnly endTime)
    {
        if (endTime <= startTime)
            throw new ArgumentException("End time must be after start time.");

        var hours = (decimal)(endTime - startTime).TotalHours;

        return new UserAvailability
        {
            TenantId = tenantId,
            UserId = userId,
            DayOfWeek = dayOfWeek,
            StartTime = startTime,
            EndTime = endTime,
            AvailableHours = Math.Round(hours, 2),
        };
    }

    // ─── Domain Methods ──────────────────────────────────────────
    public void UpdateSchedule(TimeOnly newStart, TimeOnly newEnd)
    {
        if (newEnd <= newStart)
            throw new ArgumentException("End time must be after start time.");

        StartTime = newStart;
        EndTime = newEnd;
        AvailableHours = Math.Round((decimal)(newEnd - newStart).TotalHours, 2);
        UpdatedAtUtc = DateTime.UtcNow;
    }
}
