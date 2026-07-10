namespace TaskManager.Application.DTOs;

public record AuthResponseDto(
    string Token,
    string Username,
    string Email
);

public record LoginRequest(
    string Username,
    string Password
);

public record RegisterRequest(
    string Username,
    string Email,
    string Password
);
