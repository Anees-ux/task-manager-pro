using TaskManager.Domain.Common;
using TaskManager.Domain.Enums;

namespace TaskManager.Domain.Entities.Workforce;

/// <summary>
/// Tracks approved/pending time-off for workforce capacity planning.
/// Approved time-offs zero out a user's availability on those dates.
/// </summary>
public class TimeOff : BaseEntity
{
    public Guid UserId { get; private set; }
    public DateOnly StartDate { get; private set; }
    public DateOnly EndDate { get; private set; }
    public TimeOffType Type { get; private set; }
    public TimeOffStatus Status { get; private set; } = TimeOffStatus.Pending;
    public string? Reason { get; private set; }

    // Navigation
    public User? User { get; private set; }

    // ─── Private constructor for EF Core ─────────────────────────
    private TimeOff() { }

    // ─── Factory Method ──────────────────────────────────────────
    public static TimeOff Create(Guid tenantId, Guid userId, DateOnly startDate, DateOnly endDate, TimeOffType type, string? reason = null)
    {
        if (endDate < startDate)
            throw new ArgumentException("End date cannot be before start date.");

        return new TimeOff
        {
            TenantId = tenantId,
            UserId = userId,
            StartDate = startDate,
            EndDate = endDate,
            Type = type,
            Reason = reason,
            Status = TimeOffStatus.Pending,
        };
    }

    // ─── Domain Methods ──────────────────────────────────────────
    public void Approve()
    {
        if (Status != TimeOffStatus.Pending)
            throw new InvalidOperationException($"Cannot approve time-off in '{Status}' status.");

        Status = TimeOffStatus.Approved;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void Reject()
    {
        if (Status != TimeOffStatus.Pending)
            throw new InvalidOperationException($"Cannot reject time-off in '{Status}' status.");

        Status = TimeOffStatus.Rejected;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    /// <summary>Returns the total number of calendar days in this time-off.</summary>
    public int TotalDays => EndDate.DayNumber - StartDate.DayNumber + 1;
}
