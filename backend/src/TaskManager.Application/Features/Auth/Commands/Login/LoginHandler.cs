using MediatR;
using TaskManager.Application.DTOs;
using TaskManager.Application.Features.Auth.Services;
using TaskManager.Domain.Entities.Workforce;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Features.Auth.Commands.Login;

public class LoginHandler : IRequestHandler<LoginCommand, AuthResponseDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IJwtTokenService _jwtTokenService;

    public LoginHandler(IUnitOfWork unitOfWork, IJwtTokenService jwtTokenService)
    {
        _unitOfWork = unitOfWork;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<AuthResponseDto> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var userRepo = _unitOfWork.Repository<User>();

        // Login bypasses tenant filter — users authenticate by username across all tenants
        var user = await userRepo.FirstOrDefaultAsync(
            u => u.Username == request.Username, cancellationToken)
            ?? throw new UnauthorizedAccessException("Invalid username or password.");

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid username or password.");

        // Auto-heal: Ensure user has a valid Tenant and TenantSettings assigned
        if (user.TenantId == Guid.Empty)
        {
            var tenantRepo = _unitOfWork.Repository<TaskManager.Domain.Entities.Workspace.Tenant>();
            var settingsRepo = _unitOfWork.Repository<TaskManager.Domain.Entities.Workspace.TenantSettings>();

            var existingTenant = await tenantRepo.FirstOrDefaultAsync(t => t.Slug == $"{user.Username.ToLower()}-workspace", cancellationToken)
                ?? await tenantRepo.FirstOrDefaultAsync(t => true, cancellationToken);

            if (existingTenant == null)
            {
                existingTenant = TaskManager.Domain.Entities.Workspace.Tenant.Create(
                    user.Username + "'s Workspace",
                    user.Username.ToLower() + "-workspace",
                    TaskManager.Domain.Enums.SubscriptionTier.Enterprise
                );
                await tenantRepo.AddAsync(existingTenant, cancellationToken);

                var settings = TaskManager.Domain.Entities.Workspace.TenantSettings.CreateDefault(existingTenant.Id);
                await settingsRepo.AddAsync(settings, cancellationToken);
            }

            user.AssignToTenant(existingTenant.Id);
            userRepo.Update(user);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        var token = _jwtTokenService.GenerateToken(user);

        return new AuthResponseDto(token, user.Username, user.Email);
    }
}
