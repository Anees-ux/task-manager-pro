using MediatR;
using TaskManager.Application.DTOs;
using TaskManager.Application.Features.Auth.Services;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Features.Auth.Commands.Register;

public class RegisterHandler : IRequestHandler<RegisterCommand, AuthResponseDto>
{
    private readonly IRepository<User> _userRepository;
    private readonly IJwtTokenService _jwtTokenService;

    public RegisterHandler(IRepository<User> userRepository, IJwtTokenService jwtTokenService)
    {
        _userRepository = userRepository;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<AuthResponseDto> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        // Check if username already exists
        var existingUsers = await _userRepository.FindAsync(
            u => u.Username == request.Username || u.Email == request.Email, cancellationToken);

        if (existingUsers.Any())
            throw new Common.Exceptions.ValidationException(
                new[] { new FluentValidation.Results.ValidationFailure("Username", "Username or email already exists.") });

        var user = new User
        {
            Username = request.Username,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            CreatedAt = DateTime.UtcNow
        };

        var created = await _userRepository.AddAsync(user, cancellationToken);
        var token = _jwtTokenService.GenerateToken(created);

        return new AuthResponseDto(token, created.Username, created.Email);
    }
}
