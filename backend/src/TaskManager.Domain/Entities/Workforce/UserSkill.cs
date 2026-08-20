using TaskManager.Domain.Common;
using TaskManager.Domain.Enums;

namespace TaskManager.Domain.Entities.Workforce;

/// <summary>
/// Tracks a user's proficiency in a specific skill.
/// Used by the AI TaskRouter to match tasks to qualified team members.
/// </summary>
public class UserSkill : BaseEntity
{
    public Guid UserId { get; private set; }

    /// <summary>Skill name, e.g. "React", "SQL", "DevOps", "Figma".</summary>
    public string SkillName { get; private set; } = string.Empty;

    public ProficiencyLevel Proficiency { get; private set; }
    public int YearsOfExperience { get; private set; }

    // Navigation
    public User? User { get; private set; }

    // ─── Private constructor for EF Core ─────────────────────────
    private UserSkill() { }

    // ─── Factory Method ──────────────────────────────────────────
    internal static UserSkill Create(Guid tenantId, Guid userId, string skillName, ProficiencyLevel proficiency, int yearsOfExperience)
    {
        return new UserSkill
        {
            TenantId = tenantId,
            UserId = userId,
            SkillName = skillName.Trim(),
            Proficiency = proficiency,
            YearsOfExperience = yearsOfExperience,
        };
    }

    // ─── Domain Methods ──────────────────────────────────────────
    public void UpdateProficiency(ProficiencyLevel newLevel, int? yearsOfExperience = null)
    {
        Proficiency = newLevel;
        if (yearsOfExperience.HasValue)
            YearsOfExperience = yearsOfExperience.Value;
        UpdatedAtUtc = DateTime.UtcNow;
    }
}
