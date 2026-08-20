using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using TaskManager.Application.Interfaces;

namespace TaskManager.Infrastructure.Services;

/// <summary>
/// Resolves tenant and user context from the current HTTP request's JWT claims.
/// Injected into DbContext for Global Query Filters and into interceptors for audit trails.
/// </summary>
public class TenantService : ITenantService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public TenantService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid GetCurrentTenantId()
    {
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext == null) return Guid.Empty;

        // 1. Check HttpContext.Items (populated by TenantResolutionMiddleware)
        if (httpContext.Items.TryGetValue("TenantId", out var itemVal) && itemVal is Guid itemTenantId && itemTenantId != Guid.Empty)
        {
            return itemTenantId;
        }

        // 2. Check Claims (case-insensitive search across common claim types)
        var user = httpContext.User;
        if (user?.Identity?.IsAuthenticated == true)
        {
            var claim = user.Claims.FirstOrDefault(c =>
                c.Type.Equals("tenant_id", StringComparison.OrdinalIgnoreCase) ||
                c.Type.Equals("TenantId", StringComparison.OrdinalIgnoreCase) ||
                c.Type.Equals("tenant", StringComparison.OrdinalIgnoreCase) ||
                c.Type.EndsWith("tenant_id", StringComparison.OrdinalIgnoreCase) ||
                c.Type.EndsWith("tenantid", StringComparison.OrdinalIgnoreCase));

            if (claim != null && Guid.TryParse(claim.Value, out var tenantId) && tenantId != Guid.Empty)
            {
                httpContext.Items["TenantId"] = tenantId;
                return tenantId;
            }
        }

        // 3. Check X-Tenant-Id header
        if (httpContext.Request.Headers.TryGetValue("X-Tenant-Id", out var headerVal) &&
            Guid.TryParse(headerVal, out var headerTenantId) && headerTenantId != Guid.Empty)
        {
            httpContext.Items["TenantId"] = headerTenantId;
            return headerTenantId;
        }

        return Guid.Empty;
    }

    public string? GetCurrentUserId()
    {
        return _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    }

    public string? GetCurrentIpAddress()
    {
        return _httpContextAccessor.HttpContext?.Connection?.RemoteIpAddress?.ToString();
    }
}
