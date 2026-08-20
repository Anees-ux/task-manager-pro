using TaskManager.Domain.Common;
using TaskManager.Domain.Enums;

namespace TaskManager.Domain.Entities.Workspace;

/// <summary>
/// Aggregate Root — Represents an organization/company in the multi-tenant system.
/// Each tenant has isolated data, configurable settings, and a subscription tier.
/// </summary>
public class Tenant : AggregateRoot
{
    public string Name { get; private set; } = string.Empty;

    /// <summary>URL-friendly unique identifier (e.g., "acme-corp").</summary>
    public string Slug { get; private set; } = string.Empty;

    public SubscriptionTier Tier { get; private set; }
    public int MaxUsers { get; private set; }
    public int MaxProjects { get; private set; }
    public DateTime SubscriptionExpiresAtUtc { get; private set; }
    public bool IsActive { get; private set; }

    // Navigation
    public TenantSettings? Settings { get; private set; }

    // ─── Private constructor for EF Core ─────────────────────────
    private Tenant() { }

    // ─── Factory Method ──────────────────────────────────────────
    public static Tenant Create(string name, string slug, SubscriptionTier tier)
    {
        var tenant = new Tenant
        {
            Name = name,
            Slug = slug.ToLowerInvariant().Replace(" ", "-"),
            Tier = tier,
            IsActive = true,
            SubscriptionExpiresAtUtc = DateTime.UtcNow.AddYears(1),
        };

        // Set limits based on tier
        (tenant.MaxUsers, tenant.MaxProjects) = tier switch
        {
            SubscriptionTier.Free => (5, 3),
            SubscriptionTier.Pro => (50, 25),
            SubscriptionTier.Enterprise => (500, 100),
            _ => (5, 3)
        };

        // Self-reference: Tenant's own TenantId IS its Id
        tenant.TenantId = tenant.Id;

        return tenant;
    }

    // ─── Domain Methods ──────────────────────────────────────────
    public void UpgradeTier(SubscriptionTier newTier)
    {
        if (newTier <= Tier)
            throw new InvalidOperationException($"Cannot downgrade from {Tier} to {newTier} via upgrade.");

        Tier = newTier;
        (MaxUsers, MaxProjects) = newTier switch
        {
            SubscriptionTier.Pro => (50, 25),
            SubscriptionTier.Enterprise => (500, 100),
            _ => (MaxUsers, MaxProjects)
        };
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void Deactivate()
    {
        IsActive = false;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void Activate()
    {
        IsActive = true;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void ExtendSubscription(int months)
    {
        SubscriptionExpiresAtUtc = SubscriptionExpiresAtUtc.AddMonths(months);
        UpdatedAtUtc = DateTime.UtcNow;
    }
}
