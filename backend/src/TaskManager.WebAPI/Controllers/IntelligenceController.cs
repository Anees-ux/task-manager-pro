using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Application.DTOs;
using TaskManager.Application.Features.Intelligence;

namespace TaskManager.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class IntelligenceController : ControllerBase
{
    private readonly IMediator _mediator;

    public IntelligenceController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Retrieve real-time Capacity Heatmap for the team over a date range.
    /// </summary>
    [HttpGet("capacity-heatmap")]
    [ProducesResponseType(typeof(IReadOnlyList<CapacitySnapshotDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<CapacitySnapshotDto>>> GetCapacityHeatmap(
        [FromQuery] DateOnly? startDate,
        [FromQuery] DateOnly? endDate)
    {
        var start = startDate ?? DateOnly.FromDateTime(DateTime.UtcNow);
        var end = endDate ?? start.AddDays(14); // 2-week default window

        var result = await _mediator.Send(new GetCapacityHeatmapQuery(start, end));
        return Ok(result);
    }

    /// <summary>
    /// Retrieve the Neural Decision Ledger history for transparent AI auditability.
    /// </summary>
    [HttpGet("ai-decisions")]
    [ProducesResponseType(typeof(IReadOnlyList<AiDecisionLedgerDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<AiDecisionLedgerDto>>> GetAiDecisions(
        [FromQuery] Guid? targetEntityId)
    {
        var result = await _mediator.Send(new GetAiDecisionsQuery(targetEntityId));
        return Ok(result);
    }

    /// <summary>
    /// Human review of an AI decision (Approve / Reject).
    /// </summary>
    [HttpPost("ai-decisions/{id:guid}/review")]
    [ProducesResponseType(typeof(AiDecisionLedgerDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AiDecisionLedgerDto>> ReviewAiDecision(
        Guid id,
        [FromBody] ReviewAiDecisionRequest request)
    {
        var command = new ReviewAiDecisionCommand(id, request.Approve, request.ReviewNotes);
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    /// <summary>
    /// Resolve developer blockers using Google Gemini RAG with Pinecone vector memory.
    /// </summary>
    [HttpPost("resolve-blocker")]
    [ProducesResponseType(typeof(ResolveBlockerResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ResolveBlockerResponse>> ResolveBlocker(
        [FromBody] ResolveBlockerRequest request)
    {
        var result = await _mediator.Send(new ResolveBlockerQuery(request.Question));
        return Ok(result);
    }
}
