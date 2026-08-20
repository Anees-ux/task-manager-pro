using System.Text.Json;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using TaskManager.Domain.Entities.Common;
using TaskManager.Infrastructure.Data;

namespace TaskManager.Infrastructure.BackgroundServices;

/// <summary>
/// Background worker implementing the Transactional Outbox Pattern.
/// Periodically polls the OutboxMessages table, deserializes domain events back to their original types,
/// and dispatches them via MediatR (IPublisher) to guarantee at-least-once delivery and eventual consistency.
/// </summary>
public class OutboxProcessorBackgroundService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<OutboxProcessorBackgroundService> _logger;
    private readonly TimeSpan _pollingInterval = TimeSpan.FromSeconds(10);

    public OutboxProcessorBackgroundService(
        IServiceScopeFactory scopeFactory,
        ILogger<OutboxProcessorBackgroundService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation(
            "[OUTBOX PROCESSOR] Background service initialized. Polling interval: {Interval}s.",
            _pollingInterval.TotalSeconds);

        using var timer = new PeriodicTimer(_pollingInterval);

        while (!stoppingToken.IsCancellationRequested && await timer.WaitForNextTickAsync(stoppingToken))
        {
            try
            {
                await ProcessOutboxBatchAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[OUTBOX PROCESSOR] Unhandled exception occurred while processing outbox batch.");
            }
        }
    }

    private async Task ProcessOutboxBatchAsync(CancellationToken stoppingToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var publisher = scope.ServiceProvider.GetRequiredService<IPublisher>();

        // 1. Fetch unprocessed outbox messages in FIFO order (batch limit: 20)
        var messages = await dbContext.OutboxMessages
            .Where(m => m.ProcessedOnUtc == null)
            .OrderBy(m => m.OccurredOnUtc)
            .Take(20)
            .ToListAsync(stoppingToken);

        if (messages.Count == 0) return;

        _logger.LogInformation("[OUTBOX PROCESSOR] Discovered {Count} pending outbox message(s) to dispatch.", messages.Count);

        foreach (var message in messages)
        {
            try
            {
                // 2. Resolve original Event Type from the stored type name string
                var eventType = Type.GetType(message.Type)
                    ?? AppDomain.CurrentDomain.GetAssemblies()
                        .Select(a => a.GetType(message.Type))
                        .FirstOrDefault(t => t != null);

                if (eventType == null)
                {
                    _logger.LogError(
                        "[OUTBOX PROCESSOR] Unable to resolve CLR type '{TypeName}' for Outbox Message {MessageId}.",
                        message.Type, message.Id);

                    message.Error = $"Could not resolve Type: {message.Type}";
                    message.ProcessedOnUtc = DateTime.UtcNow; // Mark processed to avoid poison message loop
                    continue;
                }

                // 3. Deserialize JSON content back to the specific domain event type
                var domainEvent = JsonSerializer.Deserialize(message.Content, eventType);

                if (domainEvent is INotification notification)
                {
                    // 4. Publish via MediatR IPublisher to invoke all registered INotificationHandler<T> handlers
                    await publisher.Publish(notification, stoppingToken);

                    message.ProcessedOnUtc = DateTime.UtcNow;
                    message.Error = null;

                    _logger.LogInformation(
                        "[OUTBOX PROCESSOR] Successfully published domain event {EventType} ({MessageId}).",
                        eventType.Name, message.Id);
                }
                else
                {
                    message.Error = $"Deserialized object from message {message.Id} does not implement INotification.";
                    message.ProcessedOnUtc = DateTime.UtcNow;

                    _logger.LogWarning(
                        "[OUTBOX PROCESSOR] Event {EventType} ({MessageId}) does not implement INotification.",
                        eventType.Name, message.Id);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "[OUTBOX PROCESSOR] Failed to dispatch Outbox Message {MessageId} ({Type}).",
                    message.Id, message.Type);

                message.Error = ex.ToString();
            }
        }

        // 5. Persist processing timestamps and error updates back to the database
        await dbContext.SaveChangesAsync(stoppingToken);
    }
}
