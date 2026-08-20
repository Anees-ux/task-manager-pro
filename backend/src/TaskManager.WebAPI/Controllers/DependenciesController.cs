using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Application.DTOs;
using TaskManager.Application.Features.Tasks.Commands.Dependencies;

namespace TaskManager.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DependenciesController : ControllerBase
{
    private readonly IMediator _mediator;

    public DependenciesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get all dependency relationships for a task.
    /// </summary>
    [HttpGet("task/{taskId:guid}")]
    [ProducesResponseType(typeof(IReadOnlyList<TaskDependencyDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<TaskDependencyDto>>> GetByTask(Guid taskId)
    {
        var result = await _mediator.Send(new GetTaskDependenciesQuery(taskId));
        return Ok(result);
    }

    /// <summary>
    /// Create a dependency link between two tasks (predecessor blocks successor).
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(TaskDependencyDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<TaskDependencyDto>> Create([FromBody] CreateTaskDependencyRequest request)
    {
        var command = new CreateTaskDependencyCommand(
            request.PredecessorTaskId,
            request.SuccessorTaskId,
            request.Type,
            request.LagDays
        );

        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetByTask), new { taskId = result.SuccessorTaskId }, result);
    }

    /// <summary>
    /// Delete a dependency relationship.
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _mediator.Send(new DeleteTaskDependencyCommand(id));
        return NoContent();
    }
}
