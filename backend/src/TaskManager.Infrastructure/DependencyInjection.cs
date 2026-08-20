using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TaskManager.Application.Features.Auth.Services;
using TaskManager.Application.Interfaces;
using TaskManager.Domain.Interfaces;
using TaskManager.Infrastructure.BackgroundServices;
using TaskManager.Infrastructure.Data;
using TaskManager.Infrastructure.Interceptors;
using TaskManager.Infrastructure.Repositories;
using TaskManager.Infrastructure.Services;

namespace TaskManager.Infrastructure;

/// <summary>
/// Registers Infrastructure layer services in the DI container.
/// </summary>
public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        // ─── Interceptors (registered before DbContext) ──────────
        services.AddScoped<AuditSaveChangesInterceptor>();

        // ─── DbContext with SQL Server + Interceptors ────────────
        services.AddDbContext<AppDbContext>((sp, options) =>
        {
            options.UseSqlServer(
                configuration.GetConnectionString("DefaultConnection")
                    ?? "Server=.;Database=TaskManagerProDb;Integrated Security=True;TrustServerCertificate=True;");

            // Attach audit interceptor (domain events are dispatched via AppDbContext.SaveChangesAsync)
            options.AddInterceptors(
                sp.GetRequiredService<AuditSaveChangesInterceptor>());
        });

        // ─── Unit of Work ────────────────────────────────────────
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // ─── Services ────────────────────────────────────────────
        services.AddScoped<ITenantService, TenantService>();
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<ICapacityCalculator, CapacityCalculatorService>();
        services.AddHttpClient<IAiEmbeddingService, AiEmbeddingService>();
        services.AddHttpClient<IGeminiTaskRouterService, GeminiTaskRouterService>();

        // ─── Transactional Outbox Background Worker ─────────────
        services.AddHostedService<OutboxProcessorBackgroundService>();

        return services;
    }
}
