using TaskManager.Domain.Entities.Workforce;

namespace TaskManager.Application.Features.Auth.Services;

/// <summary>
/// Interface for JWT token generation.
/// </summary>
public interface IJwtTokenService
{
    string GenerateToken(User user);
}
