using MediatR;
using TaskManager.Application.Common.Exceptions;
using TaskManager.Application.DTOs;
using TaskManager.Application.Interfaces;
using TaskManager.Domain.Entities.Workspace;
using TaskManager.Domain.Enums;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Features.Tenants;

public record GetCurrentTenantQuery() : IRequest<TenantDto>;

public record UpdateTenantSettingsCommand(
    string Timezone,
    decimal DefaultWorkHoursPerDay,
    OverAllocationPolicy OverAllocationPolicy,
    bool AiAutoAssignEnabled,
    AiApprovalMode AiApprovalMode,
    decimal AiConfidenceThreshold
) : IRequest<TenantSettingsDto>;

public record UpgradeTenantSubscriptionCommand(SubscriptionTier NewTier) : IRequest<TenantDto>;

public class TenantsHandler :
    IRequestHandler<GetCurrentTenantQuery, TenantDto>,
    IRequestHandler<UpdateTenantSettingsCommand, TenantSettingsDto>,
    IRequestHandler<UpgradeTenantSubscriptionCommand, TenantDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITenantService _tenantService;

    public TenantsHandler(IUnitOfWork unitOfWork, ITenantService tenantService)
    {
        _unitOfWork = unitOfWork;
        _tenantService = tenantService;
    }

    public async Task<TenantDto> Handle(GetCurrentTenantQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        var tenantRepo = _unitOfWork.Repository<Tenant>();
        var settingsRepo = _unitOfWork.Repository<TenantSettings>();
        var userRepo = _unitOfWork.Repository<TaskManager.Domain.Entities.Workforce.User>();

        // Fallback: If tenantId is empty, try resolving from authenticated user
        if (tenantId == Guid.Empty)
        {
            var userIdStr = _tenantService.GetCurrentUserId();
            if (!string.IsNullOrEmpty(userIdStr) && Guid.TryParse(userIdStr, out var userId))
            {
                var user = await userRepo.GetByIdAsync(userId, cancellationToken);
                if (user != null && user.TenantId != Guid.Empty)
                {
                    tenantId = user.TenantId;
                }
            }
        }

        Tenant? tenant = null;
        if (tenantId != Guid.Empty)
        {
            tenant = await tenantRepo.GetByIdAsync(tenantId, cancellationToken);
        }

        if (tenant == null)
        {
            tenant = await tenantRepo.FirstOrDefaultAsync(t => true, cancellationToken);
        }

        if (tenant == null)
        {
            tenant = Tenant.Create("Acme Global Corp", "acme-global", SubscriptionTier.Enterprise);
            await tenantRepo.AddAsync(tenant, cancellationToken);

            var defaultSettings = TenantSettings.CreateDefault(tenant.Id);
            await settingsRepo.AddAsync(defaultSettings, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        var settings = await settingsRepo.FirstOrDefaultAsync(s => s.TenantRefId == tenant.Id, cancellationToken);
        if (settings == null)
        {
            settings = TenantSettings.CreateDefault(tenant.Id);
            await settingsRepo.AddAsync(settings, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        var settingsDto = new TenantSettingsDto(
            settings.Id,
            settings.Timezone,
            settings.DefaultWorkHoursPerDay,
            settings.OverAllocationPolicy,
            settings.AiAutoAssignEnabled,
            settings.AiApprovalMode,
            settings.AiConfidenceThreshold
        );

        return new TenantDto(
            tenant.Id,
            tenant.Name,
            tenant.Slug,
            tenant.Tier,
            tenant.MaxUsers,
            tenant.MaxProjects,
            tenant.SubscriptionExpiresAtUtc,
            tenant.IsActive,
            settingsDto
        );
    }

    public async Task<TenantSettingsDto> Handle(UpdateTenantSettingsCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        var settingsRepo = _unitOfWork.Repository<TenantSettings>();
        var tenantRepo = _unitOfWork.Repository<Tenant>();
        var userRepo = _unitOfWork.Repository<TaskManager.Domain.Entities.Workforce.User>();

        if (tenantId == Guid.Empty)
        {
            var userIdStr = _tenantService.GetCurrentUserId();
            if (!string.IsNullOrEmpty(userIdStr) && Guid.TryParse(userIdStr, out var userId))
            {
                var user = await userRepo.GetByIdAsync(userId, cancellationToken);
                if (user != null && user.TenantId != Guid.Empty)
                {
                    tenantId = user.TenantId;
                }
            }
        }

        if (tenantId == Guid.Empty)
        {
            var firstTenant = await tenantRepo.FirstOrDefaultAsync(t => true, cancellationToken);
            if (firstTenant != null)
            {
                tenantId = firstTenant.Id;
            }
        }

        var settings = await settingsRepo.FirstOrDefaultAsync(s => s.TenantRefId == tenantId, cancellationToken);

        if (settings == null)
        {
            settings = TenantSettings.CreateDefault(tenantId);
            await settingsRepo.AddAsync(settings, cancellationToken);
        }

        settings.UpdateTimezone(request.Timezone);
        settings.UpdateWorkHours(request.DefaultWorkHoursPerDay);
        settings.ConfigureAi(request.AiAutoAssignEnabled, request.AiApprovalMode, request.AiConfidenceThreshold);

        settingsRepo.Update(settings);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new TenantSettingsDto(
            settings.Id,
            settings.Timezone,
            settings.DefaultWorkHoursPerDay,
            settings.OverAllocationPolicy,
            settings.AiAutoAssignEnabled,
            settings.AiApprovalMode,
            settings.AiConfidenceThreshold
        );
    }

    public async Task<TenantDto> Handle(UpgradeTenantSubscriptionCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        var tenantRepo = _unitOfWork.Repository<Tenant>();

        var tenant = await tenantRepo.GetByIdAsync(tenantId, cancellationToken)
            ?? throw new NotFoundException(nameof(Tenant), tenantId);

        tenant.UpgradeTier(request.NewTier);
        tenantRepo.Update(tenant);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return await Handle(new GetCurrentTenantQuery(), cancellationToken);
    }
}
