using TaskManager.Domain.Common;
using TaskManager.Domain.Enums;

namespace TaskManager.Domain.Entities.Workforce;

/// <summary>
/// Aggregate Root — Represents a team member within a tenant.
/// Rich domain model with skills, availability, and financial data.
/// </summary>
public class User : AggregateRoot
{
    public string Username { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string PasswordHash { get; private set; } = string.Empty;
    public string FullName { get; private set; } = string.Empty;
    public UserRole Role { get; private set; } = UserRole.Developer;

    /// <summary>Hourly rate for financial/budget calculations.</summary>
    public decimal HourlyRate { get; private set; }

    public bool IsActive { get; private set; } = true;

    // Navigation
    public ICollection<UserSkill> Skills { get; private set; } = new List<UserSkill>();
    public ICollection<UserAvailability> Availability { get; private set; } = new List<UserAvailability>();
    public ICollection<TimeOff> TimeOffs { get; private set; } = new List<TimeOff>();

    // ─── Private constructor for EF Core ─────────────────────────
    private User() { }

    // ─── Factory Method ──────────────────────────────────────────
    public static User Create(Guid tenantId, string username, string email, string passwordHash, string fullName, UserRole role = UserRole.Developer)
    {
        return new User
        {
            TenantId = tenantId,
            Username = username,
            Email = email,
            PasswordHash = passwordHash,
            FullName = fullName,
            Role = role,
            IsActive = true,
        };
    }

    // ─── Domain Methods ──────────────────────────────────────────
    public void UpdateProfile(string fullName, string email)
    {
        FullName = fullName;
        Email = email;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void ChangeRole(UserRole newRole)
    {
        Role = newRole;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void AssignToTenant(Guid tenantId)
    {
        TenantId = tenantId;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void UpdateHourlyRate(decimal rate)
    {
        if (rate < 0)
            throw new ArgumentOutOfRangeException(nameof(rate), "Hourly rate cannot be negative.");

        HourlyRate = rate;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void Deactivate()
    {
        IsActive = false;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void Activate()
    {
        IsActive = true;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void UpdatePasswordHash(string newPasswordHash)
    {
        PasswordHash = newPasswordHash;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void AddSkill(string skillName, ProficiencyLevel proficiency, int yearsOfExperience = 0)
    {
        var existingSkill = Skills.FirstOrDefault(s =>
            s.SkillName.Equals(skillName, StringComparison.OrdinalIgnoreCase));

        if (existingSkill != null)
            throw new InvalidOperationException($"User already has skill '{skillName}'.");

        var skill = UserSkill.Create(TenantId, Id, skillName, proficiency, yearsOfExperience);
        Skills.Add(skill);
        UpdatedAtUtc = DateTime.UtcNow;
    }
}
