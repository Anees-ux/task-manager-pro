using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Application.DTOs;
using TaskManager.Application.Features.Workforce.Commands;
using TaskManager.Application.Features.Workforce.Queries;

namespace TaskManager.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WorkforceController : ControllerBase
{
    private readonly IMediator _mediator;

    public WorkforceController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Retrieve all team members in the tenant workspace.
    /// </summary>
    [HttpGet("users")]
    [ProducesResponseType(typeof(IReadOnlyList<UserDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<UserDto>>> GetAllUsers()
    {
        var result = await _mediator.Send(new GetAllUsersQuery());
        return Ok(result);
    }

    /// <summary>
    /// Invite or provision a new team member in the workspace.
    /// Immediately activates user for test roster visibility.
    /// </summary>
    [HttpPost("users/invite")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<UserDto>> InviteUser([FromBody] InviteUserRequest request)
    {
        var command = new InviteUserCommand(request.FullName, request.Email, request.Role, request.Department, request.HourlyRate, request.Skills);
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    /// <summary>
    /// Retrieve full user profile with skills, weekly rosters, and time-offs.
    /// </summary>
    [HttpGet("users/{id:guid}/profile")]
    [ProducesResponseType(typeof(UserProfileResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserProfileResponse>> GetUserProfile(Guid id)
    {
        var result = await _mediator.Send(new GetUserProfileQuery(id));
        return Ok(result);
    }

    /// <summary>
    /// Add or update a proficiency skill for a user (used by AI Task Router).
    /// </summary>
    [HttpPost("users/{id:guid}/skills")]
    [ProducesResponseType(typeof(UserSkillDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<UserSkillDto>> AddSkill(Guid id, [FromBody] AddUserSkillRequest request)
    {
        var command = new AddUserSkillCommand(id, request.SkillName, request.Proficiency, request.YearsOfExperience);
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    /// <summary>
    /// Configure weekly availability roster for a day of week.
    /// </summary>
    [HttpPost("users/{id:guid}/availability")]
    [ProducesResponseType(typeof(UserAvailabilityDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<UserAvailabilityDto>> SetAvailability(Guid id, [FromBody] SetAvailabilityRequest request)
    {
        var command = new SetAvailabilityCommand(id, request.DayOfWeek, request.StartTime, request.EndTime);
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    /// <summary>
    /// Update a user's billing hourly rate for budget sync.
    /// </summary>
    [HttpPut("users/{id:guid}/hourly-rate")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<UserDto>> UpdateHourlyRate(Guid id, [FromBody] decimal hourlyRate)
    {
        var command = new UpdateUserRateCommand(id, hourlyRate);
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    /// <summary>
    /// Request time off / vacation.
    /// </summary>
    [HttpPost("users/{id:guid}/time-off")]
    [ProducesResponseType(typeof(TimeOffDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<TimeOffDto>> RequestTimeOff(Guid id, [FromBody] RequestTimeOffRequest request)
    {
        var command = new RequestTimeOffCommand(id, request.StartDate, request.EndDate, request.Type, request.Reason);
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    /// <summary>
    /// List all time off requests.
    /// </summary>
    [HttpGet("time-offs")]
    [ProducesResponseType(typeof(IReadOnlyList<TimeOffDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<TimeOffDto>>> GetTimeOffs([FromQuery] Guid? userId)
    {
        var result = await _mediator.Send(new GetTimeOffsQuery(userId));
        return Ok(result);
    }

    /// <summary>
    /// Approve a pending time off (auto-recalculates daily capacity).
    /// </summary>
    [HttpPost("time-offs/{id:guid}/approve")]
    [ProducesResponseType(typeof(TimeOffDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<TimeOffDto>> ApproveTimeOff(Guid id)
    {
        var result = await _mediator.Send(new ApproveTimeOffCommand(id));
        return Ok(result);
    }

    /// <summary>
    /// Reject a time off request.
    /// </summary>
    [HttpPost("time-offs/{id:guid}/reject")]
    [ProducesResponseType(typeof(TimeOffDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<TimeOffDto>> RejectTimeOff(Guid id)
    {
        var result = await _mediator.Send(new RejectTimeOffCommand(id));
        return Ok(result);
    }
}
