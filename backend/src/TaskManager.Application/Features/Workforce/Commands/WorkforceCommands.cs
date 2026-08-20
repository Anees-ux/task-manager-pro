using MediatR;
using TaskManager.Application.Common.Exceptions;
using TaskManager.Application.DTOs;
using TaskManager.Application.Interfaces;
using TaskManager.Domain.Entities.Workforce;
using TaskManager.Domain.Enums;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Features.Workforce.Commands;

public record AddUserSkillCommand(
    Guid UserId,
    string SkillName,
    ProficiencyLevel Proficiency,
    int YearsOfExperience
) : IRequest<UserSkillDto>;

public record SetAvailabilityCommand(
    Guid UserId,
    DayOfWeek DayOfWeek,
    TimeOnly StartTime,
    TimeOnly EndTime
) : IRequest<UserAvailabilityDto>;

public record RequestTimeOffCommand(
    Guid UserId,
    DateOnly StartDate,
    DateOnly EndDate,
    TimeOffType Type,
    string? Reason
) : IRequest<TimeOffDto>;

public record ApproveTimeOffCommand(Guid TimeOffId) : IRequest<TimeOffDto>;
public record RejectTimeOffCommand(Guid TimeOffId) : IRequest<TimeOffDto>;

public record UpdateUserRateCommand(Guid UserId, decimal HourlyRate) : IRequest<UserDto>;

public record InviteUserCommand(
    string FullName,
    string Email,
    UserRole Role,
    string Department,
    decimal HourlyRate,
    string? Skills = null
) : IRequest<UserDto>;

public class WorkforceCommandHandler :
    IRequestHandler<AddUserSkillCommand, UserSkillDto>,
    IRequestHandler<SetAvailabilityCommand, UserAvailabilityDto>,
    IRequestHandler<RequestTimeOffCommand, TimeOffDto>,
    IRequestHandler<ApproveTimeOffCommand, TimeOffDto>,
    IRequestHandler<RejectTimeOffCommand, TimeOffDto>,
    IRequestHandler<UpdateUserRateCommand, UserDto>,
    IRequestHandler<InviteUserCommand, UserDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITenantService _tenantService;
    private readonly ICapacityCalculator _capacityCalculator;

    public WorkforceCommandHandler(
        IUnitOfWork unitOfWork,
        ITenantService tenantService,
        ICapacityCalculator capacityCalculator)
    {
        _unitOfWork = unitOfWork;
        _tenantService = tenantService;
        _capacityCalculator = capacityCalculator;
    }

    public async Task<UserSkillDto> Handle(AddUserSkillCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        var userRepo = _unitOfWork.Repository<User>();
        var skillRepo = _unitOfWork.Repository<UserSkill>();

        var user = await userRepo.GetByIdAsync(request.UserId, cancellationToken)
            ?? throw new NotFoundException(nameof(User), request.UserId);

        var existing = await skillRepo.FirstOrDefaultAsync(
            s => s.UserId == request.UserId && s.SkillName.ToLower() == request.SkillName.ToLower(),
            cancellationToken);

        if (existing != null)
        {
            existing.UpdateProficiency(request.Proficiency, request.YearsOfExperience);
            skillRepo.Update(existing);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return new UserSkillDto(existing.Id, existing.UserId, existing.SkillName, existing.Proficiency, existing.YearsOfExperience);
        }

        user.AddSkill(request.SkillName, request.Proficiency, request.YearsOfExperience);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var created = await skillRepo.FirstOrDefaultAsync(
            s => s.UserId == request.UserId && s.SkillName.ToLower() == request.SkillName.ToLower(),
            cancellationToken);

        return new UserSkillDto(
            created?.Id ?? Guid.NewGuid(),
            request.UserId,
            request.SkillName,
            request.Proficiency,
            request.YearsOfExperience
        );
    }

    public async Task<UserAvailabilityDto> Handle(SetAvailabilityCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        var userRepo = _unitOfWork.Repository<User>();
        var availRepo = _unitOfWork.Repository<UserAvailability>();

        var user = await userRepo.GetByIdAsync(request.UserId, cancellationToken)
            ?? throw new NotFoundException(nameof(User), request.UserId);

        var existing = await availRepo.FirstOrDefaultAsync(
            a => a.UserId == request.UserId && a.DayOfWeek == request.DayOfWeek,
            cancellationToken);

        if (existing != null)
        {
            existing.UpdateSchedule(request.StartTime, request.EndTime);
            availRepo.Update(existing);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return new UserAvailabilityDto(existing.Id, existing.UserId, existing.DayOfWeek, existing.StartTime, existing.EndTime, existing.AvailableHours);
        }

        var avail = UserAvailability.Create(tenantId, request.UserId, request.DayOfWeek, request.StartTime, request.EndTime);
        await availRepo.AddAsync(avail, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new UserAvailabilityDto(avail.Id, avail.UserId, avail.DayOfWeek, avail.StartTime, avail.EndTime, avail.AvailableHours);
    }

    public async Task<TimeOffDto> Handle(RequestTimeOffCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        var userRepo = _unitOfWork.Repository<User>();
        var timeOffRepo = _unitOfWork.Repository<TimeOff>();

        var user = await userRepo.GetByIdAsync(request.UserId, cancellationToken)
            ?? throw new NotFoundException(nameof(User), request.UserId);

        var timeOff = TimeOff.Create(tenantId, request.UserId, request.StartDate, request.EndDate, request.Type, request.Reason);
        await timeOffRepo.AddAsync(timeOff, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new TimeOffDto(
            timeOff.Id,
            timeOff.UserId,
            user.FullName ?? user.Username,
            timeOff.StartDate,
            timeOff.EndDate,
            timeOff.Type,
            timeOff.Status,
            timeOff.Reason,
            timeOff.TotalDays,
            timeOff.CreatedAtUtc
        );
    }

    public async Task<TimeOffDto> Handle(ApproveTimeOffCommand request, CancellationToken cancellationToken)
    {
        var timeOffRepo = _unitOfWork.Repository<TimeOff>();
        var userRepo = _unitOfWork.Repository<User>();

        var timeOff = await timeOffRepo.GetByIdAsync(request.TimeOffId, cancellationToken)
            ?? throw new NotFoundException(nameof(TimeOff), request.TimeOffId);

        timeOff.Approve();
        timeOffRepo.Update(timeOff);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Recalculate capacity snapshots for the dates
        for (var date = timeOff.StartDate; date <= timeOff.EndDate; date = date.AddDays(1))
        {
            await _capacityCalculator.RecalculateAndPersistAsync(timeOff.UserId, date, cancellationToken);
        }

        var user = await userRepo.GetByIdAsync(timeOff.UserId, cancellationToken);

        return new TimeOffDto(
            timeOff.Id,
            timeOff.UserId,
            user?.FullName ?? user?.Username ?? "User",
            timeOff.StartDate,
            timeOff.EndDate,
            timeOff.Type,
            timeOff.Status,
            timeOff.Reason,
            timeOff.TotalDays,
            timeOff.CreatedAtUtc
        );
    }

    public async Task<TimeOffDto> Handle(RejectTimeOffCommand request, CancellationToken cancellationToken)
    {
        var timeOffRepo = _unitOfWork.Repository<TimeOff>();
        var userRepo = _unitOfWork.Repository<User>();

        var timeOff = await timeOffRepo.GetByIdAsync(request.TimeOffId, cancellationToken)
            ?? throw new NotFoundException(nameof(TimeOff), request.TimeOffId);

        timeOff.Reject();
        timeOffRepo.Update(timeOff);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var user = await userRepo.GetByIdAsync(timeOff.UserId, cancellationToken);

        return new TimeOffDto(
            timeOff.Id,
            timeOff.UserId,
            user?.FullName ?? user?.Username ?? "User",
            timeOff.StartDate,
            timeOff.EndDate,
            timeOff.Type,
            timeOff.Status,
            timeOff.Reason,
            timeOff.TotalDays,
            timeOff.CreatedAtUtc
        );
    }

    public async Task<UserDto> Handle(UpdateUserRateCommand request, CancellationToken cancellationToken)
    {
        var userRepo = _unitOfWork.Repository<User>();
        var user = await userRepo.GetByIdAsync(request.UserId, cancellationToken)
            ?? throw new NotFoundException(nameof(User), request.UserId);

        user.UpdateHourlyRate(request.HourlyRate);
        userRepo.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new UserDto(user.Id, user.Username, user.Email, user.FullName, user.Role, user.HourlyRate, user.IsActive, user.CreatedAtUtc);
    }

    public async Task<UserDto> Handle(InviteUserCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        var userRepo = _unitOfWork.Repository<User>();

        // Generate clean unique username from email
        var baseUsername = request.Email.Split('@')[0].Replace(".", "").ToLower();
        var username = baseUsername;
        int suffix = 1;
        while (await userRepo.AnyAsync(u => u.Username == username, cancellationToken))
        {
            username = $"{baseUsername}{suffix++}";
        }

        // Create user with IsActive = true immediately for instant test roster visibility
        var user = User.Create(
            tenantId: tenantId,
            username: username,
            email: request.Email,
            passwordHash: BCrypt.Net.BCrypt.HashPassword("Password@123"),
            fullName: request.FullName,
            role: request.Role
        );

        user.UpdateHourlyRate(request.HourlyRate);
        user.Activate(); // Ensures IsActive = true immediately

        // Parse and register actual technical skills for AI Task Router matching
        if (!string.IsNullOrWhiteSpace(request.Skills))
        {
            var skillList = request.Skills.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            foreach (var skill in skillList)
            {
                user.AddSkill(skill, ProficiencyLevel.Intermediate, 3);
            }
        }
        else if (!string.IsNullOrWhiteSpace(request.Department))
        {
            user.AddSkill(request.Department, ProficiencyLevel.Intermediate, 3);
        }

        await userRepo.AddAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new UserDto(user.Id, user.Username, user.Email, user.FullName, user.Role, user.HourlyRate, user.IsActive, user.CreatedAtUtc);
    }
}
