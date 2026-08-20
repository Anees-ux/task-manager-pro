using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Application.DTOs;
using TaskManager.Application.Features.Tasks.Commands.WorkLogs;

namespace TaskManager.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WorkLogsController : ControllerBase
{
    private readonly IMediator _mediator;

    public WorkLogsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Retrieve work logs filtered by task or user.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<WorkLogDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<WorkLogDto>>> GetAll(
        [FromQuery] Guid? taskId,
        [FromQuery] Guid? userId)
    {
        var result = await _mediator.Send(new GetTaskWorkLogsQuery(taskId, userId));
        return Ok(result);
    }

    /// <summary>
    /// Log work hours against a task (syncs with task actuals and project budget consumed).
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(WorkLogDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<WorkLogDto>> LogWork([FromBody] LogWorkRequest request)
    {
        var command = new LogWorkCommand(request.TaskId, request.LogDate, request.HoursWorked, request.Description);
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetAll), new { taskId = result.TaskId }, result);
    }
}
