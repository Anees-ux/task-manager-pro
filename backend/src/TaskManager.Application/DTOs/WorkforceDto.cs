using TaskManager.Domain.Enums;

namespace TaskManager.Application.DTOs;

public record UserDto(
    Guid Id,
    string Username,
    string Email,
    string FullName,
    UserRole Role,
    decimal HourlyRate,
    bool IsActive,
    DateTime CreatedAtUtc
);

public record UserSkillDto(
    Guid Id,
    Guid UserId,
    string SkillName,
    ProficiencyLevel Proficiency,
    int YearsOfExperience
);

public record AddUserSkillRequest(
    string SkillName,
    ProficiencyLevel Proficiency,
    int YearsOfExperience
);

public record UserAvailabilityDto(
    Guid Id,
    Guid UserId,
    DayOfWeek DayOfWeek,
    TimeOnly StartTime,
    TimeOnly EndTime,
    decimal AvailableHours
);

public record SetAvailabilityRequest(
    DayOfWeek DayOfWeek,
    TimeOnly StartTime,
    TimeOnly EndTime
);

public record TimeOffDto(
    Guid Id,
    Guid UserId,
    string UserName,
    DateOnly StartDate,
    DateOnly EndDate,
    TimeOffType Type,
    TimeOffStatus Status,
    string? Reason,
    int TotalDays,
    DateTime CreatedAtUtc
);

public record RequestTimeOffRequest(
    DateOnly StartDate,
    DateOnly EndDate,
    TimeOffType Type,
    string? Reason
);

public record InviteUserRequest(
    string FullName,
    string Email,
    UserRole Role,
    string Department,
    decimal HourlyRate,
    string? Skills = null
);
