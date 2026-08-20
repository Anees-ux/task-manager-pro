using TaskManager.Domain.Enums;

namespace TaskManager.Application.DTOs;

public record TenantDto(
    Guid Id,
    string Name,
    string Slug,
    SubscriptionTier Tier,
    int MaxUsers,
    int MaxProjects,
    DateTime SubscriptionExpiresAtUtc,
    bool IsActive,
    TenantSettingsDto? Settings
);

public record TenantSettingsDto(
    Guid Id,
    string Timezone,
    decimal DefaultWorkHoursPerDay,
    OverAllocationPolicy OverAllocationPolicy,
    bool AiAutoAssignEnabled,
    AiApprovalMode AiApprovalMode,
    decimal AiConfidenceThreshold
);

public record UpdateTenantSettingsRequest(
    string Timezone,
    decimal DefaultWorkHoursPerDay,
    OverAllocationPolicy OverAllocationPolicy,
    bool AiAutoAssignEnabled,
    AiApprovalMode AiApprovalMode,
    decimal AiConfidenceThreshold
);

public record UpgradeSubscriptionRequest(
    SubscriptionTier NewTier
);
