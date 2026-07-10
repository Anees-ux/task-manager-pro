using TaskManager.Domain.Entities;

namespace TaskManager.Application.Features.Auth.Services;

/// <summary>
/// Interface for JWT token generation.
/// </summary>
public interface IJwtTokenService
{
    string GenerateToken(User user);
}
