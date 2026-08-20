using System.Security.Claims;

namespace TaskManager.WebAPI.Middleware;

/// <summary>
/// Middleware to ensure tenant context is resolved from JWT claims or headers.
/// Sets tenant information in HttpContext.Items for fast downstream retrieval.
/// </summary>
public class TenantResolutionMiddleware
{
    private readonly RequestDelegate _next;

    public TenantResolutionMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var tenantClaim = context.User?.Claims?.FirstOrDefault(c =>
            c.Type.Equals("tenant_id", StringComparison.OrdinalIgnoreCase) ||
            c.Type.Equals("TenantId", StringComparison.OrdinalIgnoreCase) ||
            c.Type.Equals("tenant", StringComparison.OrdinalIgnoreCase) ||
            c.Type.EndsWith("tenant_id", StringComparison.OrdinalIgnoreCase) ||
            c.Type.EndsWith("tenantid", StringComparison.OrdinalIgnoreCase))?.Value;

        if (!string.IsNullOrEmpty(tenantClaim) && Guid.TryParse(tenantClaim, out var tenantId) && tenantId != Guid.Empty)
        {
            context.Items["TenantId"] = tenantId;
        }
        else if (context.Request.Headers.TryGetValue("X-Tenant-Id", out var headerTenant) &&
                 Guid.TryParse(headerTenant, out var headerTenantId) && headerTenantId != Guid.Empty)
        {
            context.Items["TenantId"] = headerTenantId;
        }

        await _next(context);
    }
}
