using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Domain.Entities.Workforce;

namespace TaskManager.Infrastructure.Data.Configurations;

public class UserAvailabilityConfiguration : IEntityTypeConfiguration<UserAvailability>
{
    public void Configure(EntityTypeBuilder<UserAvailability> builder)
    {
        builder.HasKey(a => a.Id);
        builder.Property(a => a.DayOfWeek).HasConversion<string>().HasMaxLength(20);
        builder.Property(a => a.AvailableHours).HasPrecision(4, 2);

        // One entry per user per day-of-week
        builder.HasIndex(a => new { a.UserId, a.DayOfWeek }).IsUnique();
    }
}
