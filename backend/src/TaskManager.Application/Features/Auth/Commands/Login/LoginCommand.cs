using MediatR;
using TaskManager.Application.DTOs;

namespace TaskManager.Application.Features.Auth.Commands.Login;

public record LoginCommand(
    string Username,
    string Password
) : IRequest<AuthResponseDto>;
