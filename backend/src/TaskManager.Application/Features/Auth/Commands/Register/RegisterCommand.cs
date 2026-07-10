using MediatR;
using TaskManager.Application.DTOs;

namespace TaskManager.Application.Features.Auth.Commands.Register;

public record RegisterCommand(
    string Username,
    string Email,
    string Password
) : IRequest<AuthResponseDto>;
