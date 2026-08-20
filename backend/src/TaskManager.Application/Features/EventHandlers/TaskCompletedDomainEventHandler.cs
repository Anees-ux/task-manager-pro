using MediatR;
using Microsoft.Extensions.Logging;
using TaskManager.Application.Interfaces;
using TaskManager.Domain.Entities.Execution;
using TaskManager.Domain.Enums;
using TaskManager.Domain.Events;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Features.EventHandlers;

/// <summary>
/// Domain Event Handler for RAG Vector Ingestion.
/// When a task is marked as Completed/Done, this handler embeds the task resolution context
/// using Google Gemini and upserts the vector into Pinecone for BlockerResolver retrieval.
/// </summary>
public class TaskCompletedDomainEventHandler : INotificationHandler<TaskStatusChangedEvent>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IAiEmbeddingService _aiEmbeddingService;
    private readonly ILogger<TaskCompletedDomainEventHandler> _logger;

    public TaskCompletedDomainEventHandler(
        IUnitOfWork unitOfWork,
        IAiEmbeddingService aiEmbeddingService,
        ILogger<TaskCompletedDomainEventHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _aiEmbeddingService = aiEmbeddingService;
        _logger = logger;
    }

    public async Task Handle(TaskStatusChangedEvent notification, CancellationToken cancellationToken)
    {
        if (notification.NewStatus != TaskItemStatus.Done)
        {
            return;
        }

        _logger.LogInformation("[RAG INGESTION] Task {TaskId} moved to Done. Generating vector embedding...", notification.TaskId);

        try
        {
            var taskRepo = _unitOfWork.Repository<TaskItem>();
            var task = await taskRepo.GetByIdAsync(notification.TaskId, cancellationToken);

            if (task == null)
            {
                _logger.LogWarning("[RAG INGESTION] Task {TaskId} was not found for embedding generation.", notification.TaskId);
                return;
            }

            // Construct rich context representing this completed task
            var contextBuilder = new System.Text.StringBuilder();
            contextBuilder.AppendLine($"Task Code: {task.TaskCode}");
            contextBuilder.AppendLine($"Title: {task.Title}");
            if (!string.IsNullOrWhiteSpace(task.Description))
            {
                contextBuilder.AppendLine($"Description: {task.Description}");
            }
            if (!string.IsNullOrWhiteSpace(task.RequiredSkills))
            {
                contextBuilder.AppendLine($"Skills/Technologies: {task.RequiredSkills}");
            }
            contextBuilder.AppendLine($"Priority: {task.Priority}");
            contextBuilder.AppendLine($"Actual Hours Worked: {task.ActualHours}h");
            contextBuilder.AppendLine($"Completed Timestamp: {task.CompletedAtUtc ?? DateTime.UtcNow:u}");

            var embeddingText = contextBuilder.ToString();

            // Upsert vector into Pinecone with task ID as vector ID
            await _aiEmbeddingService.UpsertTaskEmbeddingAsync(task.Id.ToString(), embeddingText, cancellationToken);

            _logger.LogInformation("[RAG INGESTION] Successfully ingested vector for Task {TaskCode} ({TaskId}) into Pinecone Vector DB.",
                task.TaskCode, task.Id);
        }
        catch (Exception ex)
        {
            // Decoupled error isolation: Vector ingestion failure must not block the user's status transition
            _logger.LogError(ex, "[RAG INGESTION] Failed to generate/upsert vector embedding for Task {TaskId}. Continuing gracefully.",
                notification.TaskId);
        }
    }
}
