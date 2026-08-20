using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Domain.Entities.Intelligence;

namespace TaskManager.Infrastructure.Data.Configurations;

public class CapacitySnapshotConfiguration : IEntityTypeConfiguration<CapacitySnapshot>
{
    public void Configure(EntityTypeBuilder<CapacitySnapshot> builder)
    {
        builder.HasKey(c => c.Id);
        builder.Property(c => c.AvailableHours).HasPrecision(6, 2);
        builder.Property(c => c.AllocatedHours).HasPrecision(6, 2);
        builder.Property(c => c.LoggedHours).HasPrecision(6, 2);
        builder.Property(c => c.HeatStatus).HasConversion<string>().HasMaxLength(50);
        builder.Ignore(c => c.UtilizationPercent); // Computed, not mapped
        builder.Ignore(c => c.FreeHours);           // Computed, not mapped

        // Unique: One snapshot per user per date
        builder.HasIndex(c => new { c.UserId, c.Date }).IsUnique();

        // Performance index for team capacity queries
        builder.HasIndex(c => new { c.TenantId, c.Date, c.HeatStatus });
    }
}
