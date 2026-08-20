namespace TaskManager.Application.Interfaces;

/// <summary>
/// Resolves the current tenant context from the HTTP request (JWT claims).
/// Injected into DbContext and services that need tenant-scoped data access.
/// </summary>
public interface ITenantService
{
    /// <summary>Returns the TenantId from the current user's JWT claims.</summary>
    Guid GetCurrentTenantId();

    /// <summary>Returns the current user's ID from JWT claims.</summary>
    string? GetCurrentUserId();

    /// <summary>Returns the current user's IP address.</summary>
    string? GetCurrentIpAddress();
}
