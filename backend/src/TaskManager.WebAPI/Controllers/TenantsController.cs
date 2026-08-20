using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Application.DTOs;
using TaskManager.Application.Features.Tenants;

namespace TaskManager.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TenantsController : ControllerBase
{
    private readonly IMediator _mediator;

    public TenantsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Retrieve current tenant workspace info, subscription tier, and settings.
    /// </summary>
    [HttpGet("me")]
    [ProducesResponseType(typeof(TenantDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<TenantDto>> GetCurrentTenant()
    {
        var result = await _mediator.Send(new GetCurrentTenantQuery());
        return Ok(result);
    }

    /// <summary>
    /// Update tenant-wide settings (timezone, work hours, AI auto-assign, confidence threshold).
    /// </summary>
    [HttpPut("settings")]
    [ProducesResponseType(typeof(TenantSettingsDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<TenantSettingsDto>> UpdateSettings([FromBody] UpdateTenantSettingsRequest request)
    {
        var command = new UpdateTenantSettingsCommand(
            request.Timezone,
            request.DefaultWorkHoursPerDay,
            request.OverAllocationPolicy,
            request.AiAutoAssignEnabled,
            request.AiApprovalMode,
            request.AiConfidenceThreshold
        );

        var result = await _mediator.Send(command);
        return Ok(result);
    }

    /// <summary>
    /// Upgrade tenant subscription tier (Free -> Pro -> Enterprise).
    /// </summary>
    [HttpPost("upgrade")]
    [ProducesResponseType(typeof(TenantDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<TenantDto>> UpgradeSubscription([FromBody] UpgradeSubscriptionRequest request)
    {
        var command = new UpgradeTenantSubscriptionCommand(request.NewTier);
        var result = await _mediator.Send(command);
        return Ok(result);
    }
}
