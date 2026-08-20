using MediatR;
using Microsoft.Extensions.Logging;
using System.Diagnostics;

namespace TaskManager.Application.Common.Behaviors;

/// <summary>
/// MediatR pipeline behavior that logs every request/response with execution time.
/// Logs slow queries (>500ms) as warnings.
/// </summary>
public class LoggingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly ILogger<LoggingBehavior<TRequest, TResponse>> _logger;

    public LoggingBehavior(ILogger<LoggingBehavior<TRequest, TResponse>> logger)
    {
        _logger = logger;
    }

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        var requestName = typeof(TRequest).Name;
        _logger.LogInformation("[START] {RequestName}", requestName);

        var stopwatch = Stopwatch.StartNew();
        var response = await next(cancellationToken);
        stopwatch.Stop();

        var elapsedMs = stopwatch.ElapsedMilliseconds;

        if (elapsedMs > 500)
        {
            _logger.LogWarning("[SLOW] {RequestName} took {ElapsedMs}ms", requestName, elapsedMs);
        }
        else
        {
            _logger.LogInformation("[END] {RequestName} completed in {ElapsedMs}ms", requestName, elapsedMs);
        }

        return response;
    }
}
