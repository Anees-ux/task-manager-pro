using TaskManager.Domain.Common;
using TaskManager.Domain.Enums;

namespace TaskManager.Domain.Entities.Workspace;

/// <summary>
/// Tenant-level configuration. One-to-one relationship with Tenant.
/// Controls timezone, work hours, over-allocation policy, and AI behavior.
/// </summary>
public class TenantSettings : BaseEntity
{
    public Guid TenantRefId { get; private set; }

    /// <summary>IANA timezone string, e.g. "Asia/Karachi".</summary>
    public string Timezone { get; private set; } = "UTC";

    /// <summary>Default working hours per day for capacity calculations.</summary>
    public decimal DefaultWorkHoursPerDay { get; private set; } = 8.0m;

    /// <summary>How the system handles user over-allocation.</summary>
    public OverAllocationPolicy OverAllocationPolicy { get; private set; } = OverAllocationPolicy.Warn;

    /// <summary>Whether AI agents can auto-assign tasks.</summary>
    public bool AiAutoAssignEnabled { get; private set; }

    /// <summary>Whether AI decisions require human approval.</summary>
    public AiApprovalMode AiApprovalMode { get; private set; } = AiApprovalMode.RequireApproval;

    /// <summary>Minimum confidence score for auto-applying AI decisions (0.0-1.0).</summary>
    public decimal AiConfidenceThreshold { get; private set; } = 0.85m;

    // Navigation
    public Tenant? Tenant { get; private set; }

    // ─── Private constructor for EF Core ─────────────────────────
    private TenantSettings() { }

    // ─── Factory Method ──────────────────────────────────────────
    public static TenantSettings CreateDefault(Guid tenantId)
    {
        return new TenantSettings
        {
            TenantRefId = tenantId,
            TenantId = tenantId, // Multi-tenancy field
        };
    }

    // ─── Domain Methods ──────────────────────────────────────────
    public void UpdateTimezone(string timezone)
    {
        Timezone = timezone;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void UpdateWorkHours(decimal hours)
    {
        if (hours is < 1 or > 24)
            throw new ArgumentOutOfRangeException(nameof(hours), "Work hours must be between 1 and 24.");

        DefaultWorkHoursPerDay = hours;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void ConfigureAi(bool autoAssignEnabled, AiApprovalMode approvalMode, decimal confidenceThreshold)
    {
        if (confidenceThreshold is < 0 or > 1)
            throw new ArgumentOutOfRangeException(nameof(confidenceThreshold), "Confidence threshold must be between 0.0 and 1.0.");

        AiAutoAssignEnabled = autoAssignEnabled;
        AiApprovalMode = approvalMode;
        AiConfidenceThreshold = confidenceThreshold;
        UpdatedAtUtc = DateTime.UtcNow;
    }
}
