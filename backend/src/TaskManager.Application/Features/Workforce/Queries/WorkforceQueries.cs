using MediatR;
using TaskManager.Application.Common.Exceptions;
using TaskManager.Application.DTOs;
using TaskManager.Domain.Entities.Workforce;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Features.Workforce.Queries;

public record GetAllUsersQuery() : IRequest<IReadOnlyList<UserDto>>;
public record GetUserProfileQuery(Guid UserId) : IRequest<UserProfileResponse>;
public record GetTimeOffsQuery(Guid? UserId = null) : IRequest<IReadOnlyList<TimeOffDto>>;

public record UserProfileResponse(
    UserDto User,
    IReadOnlyList<UserSkillDto> Skills,
    IReadOnlyList<UserAvailabilityDto> Availability,
    IReadOnlyList<TimeOffDto> TimeOffs
);

public class WorkforceQueriesHandler :
    IRequestHandler<GetAllUsersQuery, IReadOnlyList<UserDto>>,
    IRequestHandler<GetUserProfileQuery, UserProfileResponse>,
    IRequestHandler<GetTimeOffsQuery, IReadOnlyList<TimeOffDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public WorkforceQueriesHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<UserDto>> Handle(GetAllUsersQuery request, CancellationToken cancellationToken)
    {
        var userRepo = _unitOfWork.Repository<User>();
        var users = await userRepo.GetAllAsync(cancellationToken);

        return users.Select(u => new UserDto(
            u.Id,
            u.Username,
            u.Email,
            u.FullName,
            u.Role,
            u.HourlyRate,
            u.IsActive,
            u.CreatedAtUtc
        )).ToList();
    }

    public async Task<UserProfileResponse> Handle(GetUserProfileQuery request, CancellationToken cancellationToken)
    {
        var userRepo = _unitOfWork.Repository<User>();
        var skillRepo = _unitOfWork.Repository<UserSkill>();
        var availRepo = _unitOfWork.Repository<UserAvailability>();
        var timeOffRepo = _unitOfWork.Repository<TimeOff>();

        var user = await userRepo.GetByIdAsync(request.UserId, cancellationToken)
            ?? throw new NotFoundException(nameof(User), request.UserId);

        var skills = (await skillRepo.FindAsync(s => s.UserId == user.Id, cancellationToken))
            .Select(s => new UserSkillDto(s.Id, s.UserId, s.SkillName, s.Proficiency, s.YearsOfExperience))
            .ToList();

        var availability = (await availRepo.FindAsync(a => a.UserId == user.Id, cancellationToken))
            .Select(a => new UserAvailabilityDto(a.Id, a.UserId, a.DayOfWeek, a.StartTime, a.EndTime, a.AvailableHours))
            .ToList();

        var timeOffs = (await timeOffRepo.FindAsync(t => t.UserId == user.Id, cancellationToken))
            .Select(t => new TimeOffDto(t.Id, t.UserId, user.FullName ?? user.Username, t.StartDate, t.EndDate, t.Type, t.Status, t.Reason, t.TotalDays, t.CreatedAtUtc))
            .ToList();

        var userDto = new UserDto(user.Id, user.Username, user.Email, user.FullName, user.Role, user.HourlyRate, user.IsActive, user.CreatedAtUtc);

        return new UserProfileResponse(userDto, skills, availability, timeOffs);
    }

    public async Task<IReadOnlyList<TimeOffDto>> Handle(GetTimeOffsQuery request, CancellationToken cancellationToken)
    {
        var timeOffRepo = _unitOfWork.Repository<TimeOff>();
        var userRepo = _unitOfWork.Repository<User>();

        var timeOffs = await timeOffRepo.FindAsync(
            t => !request.UserId.HasValue || t.UserId == request.UserId.Value,
            cancellationToken);

        var users = (await userRepo.GetAllAsync(cancellationToken)).ToDictionary(u => u.Id);

        return timeOffs.Select(t =>
        {
            users.TryGetValue(t.UserId, out var user);
            return new TimeOffDto(
                t.Id,
                t.UserId,
                user?.FullName ?? user?.Username ?? "User",
                t.StartDate,
                t.EndDate,
                t.Type,
                t.Status,
                t.Reason,
                t.TotalDays,
                t.CreatedAtUtc
            );
        }).ToList();
    }
}
