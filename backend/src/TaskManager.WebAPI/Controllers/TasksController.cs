using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Application.DTOs;
using TaskManager.Application.Features.Tasks.Commands.CreateTask;
using TaskManager.Application.Features.Tasks.Commands.DeleteTask;
using TaskManager.Application.Features.Tasks.Commands.TaskLifecycle;
using TaskManager.Application.Features.Tasks.Commands.UpdateTask;
using TaskManager.Application.Features.Tasks.Queries.GetAllTasks;
using TaskManager.Application.Features.Tasks.Queries.GetTaskById;
using TaskManager.Domain.Enums;

namespace TaskManager.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly IMediator _mediator;

    public TasksController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Retrieve tasks filtered by status, priority, project, or assignee.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<TaskItemDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<TaskItemDto>>> GetAll(
        [FromQuery] TaskItemStatus? status,
        [FromQuery] Priority? priority,
        [FromQuery] Guid? projectId,
        [FromQuery] Guid? assigneeId)
    {
        var query = new GetAllTasksQuery(status, priority, projectId, assigneeId);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Retrieve a single task by ID.
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(TaskItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TaskItemDto>> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetTaskByIdQuery(id));
        return Ok(result);
    }

    /// <summary>
    /// Create a new task with capacity estimates and skill tags.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(TaskItemDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<TaskItemDto>> Create([FromBody] CreateTaskRequest request)
    {
        var command = new CreateTaskCommand(
            request.Title,
            request.Description,
            request.TaskCode,
            request.ProjectId,
            request.Priority,
            request.EstimatedHours,
            request.DueDateUtc,
            request.AssigneeId,
            request.RequiredSkills
        );

        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>
    /// Update task details, estimates, and skills.
    /// </summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(TaskItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TaskItemDto>> Update(Guid id, [FromBody] UpdateTaskRequest request)
    {
        var command = new UpdateTaskCommand(
            id,
            request.Title,
            request.Description,
            request.Priority,
            request.EstimatedHours,
            request.DueDateUtc,
            request.RequiredSkills
        );

        var result = await _mediator.Send(command);
        return Ok(result);
    }

    /// <summary>
    /// Assign a task to a user (triggers capacity recalculation).
    /// </summary>
    [HttpPost("{id:guid}/assign")]
    [ProducesResponseType(typeof(TaskItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TaskItemDto>> Assign(Guid id, [FromBody] AssignTaskRequest request)
    {
        var command = new AssignTaskCommand(id, request.AssigneeId);
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    /// <summary>
    /// Change task lifecycle status.
    /// </summary>
    [HttpPost("{id:guid}/status")]
    [ProducesResponseType(typeof(TaskItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TaskItemDto>> ChangeStatus(Guid id, [FromBody] ChangeTaskStatusRequest request)
    {
        var command = new ChangeTaskStatusCommand(id, request.Status);
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    /// <summary>
    /// Shift task deadline (triggers Ripple Effect Engine cascade analysis).
    /// </summary>
    [HttpPost("{id:guid}/shift-deadline")]
    [ProducesResponseType(typeof(TaskItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TaskItemDto>> ShiftDeadline(Guid id, [FromBody] ShiftDeadlineRequest request)
    {
        var command = new ShiftDeadlineCommand(id, request.NewDeadlineUtc, request.Reason);
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    /// <summary>
    /// Delete a task (soft delete).
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _mediator.Send(new DeleteTaskCommand(id));
        return NoContent();
    }
}
