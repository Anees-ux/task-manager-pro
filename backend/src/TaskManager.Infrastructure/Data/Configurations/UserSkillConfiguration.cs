using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Domain.Entities.Workforce;

namespace TaskManager.Infrastructure.Data.Configurations;

public class UserSkillConfiguration : IEntityTypeConfiguration<UserSkill>
{
    public void Configure(EntityTypeBuilder<UserSkill> builder)
    {
        builder.HasKey(s => s.Id);
        builder.Property(s => s.SkillName).IsRequired().HasMaxLength(100);
        builder.Property(s => s.Proficiency).HasConversion<string>().HasMaxLength(50);

        // Prevent duplicate skills per user
        builder.HasIndex(s => new { s.UserId, s.SkillName }).IsUnique();
    }
}
