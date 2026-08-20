using MediatR;
using TaskManager.Application.DTOs;
using TaskManager.Application.Features.Auth.Services;
using TaskManager.Application.Interfaces;
using TaskManager.Domain.Entities.Workforce;
using TaskManager.Domain.Entities.Workspace;
using TaskManager.Domain.Enums;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Features.Auth.Commands.Register;

public class RegisterHandler : IRequestHandler<RegisterCommand, AuthResponseDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IJwtTokenService _jwtTokenService;

    public RegisterHandler(IUnitOfWork unitOfWork, IJwtTokenService jwtTokenService)
    {
        _unitOfWork = unitOfWork;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<AuthResponseDto> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        var userRepo = _unitOfWork.Repository<User>();
        var tenantRepo = _unitOfWork.Repository<Tenant>();

        // Check if username or email already exists (across all tenants for registration)
        var existingUser = await userRepo.FirstOrDefaultAsync(
            u => u.Username == request.Username || u.Email == request.Email, cancellationToken);

        if (existingUser != null)
            throw new Common.Exceptions.ValidationException(
                new[] { new FluentValidation.Results.ValidationFailure("Username", "Username or email already exists.") });

        // Create a new tenant for the registering user (they become the admin)
        var tenant = Tenant.Create(request.Username + "'s Workspace", request.Username + "-workspace", SubscriptionTier.Free);
        await tenantRepo.AddAsync(tenant, cancellationToken);

        // Create default tenant settings
        var settingsRepo = _unitOfWork.Repository<TenantSettings>();
        var settings = TenantSettings.CreateDefault(tenant.Id);
        await settingsRepo.AddAsync(settings, cancellationToken);

        // Create the user as admin of the new tenant
        var user = User.Create(
            tenantId: tenant.Id,
            username: request.Username,
            email: request.Email,
            passwordHash: BCrypt.Net.BCrypt.HashPassword(request.Password),
            fullName: request.Username, // Default full name to username
            role: UserRole.Admin
        );

        await userRepo.AddAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var token = _jwtTokenService.GenerateToken(user);

        return new AuthResponseDto(token, user.Username, user.Email);
    }
}
