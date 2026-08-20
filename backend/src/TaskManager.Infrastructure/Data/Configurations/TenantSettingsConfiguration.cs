using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Domain.Entities.Workspace;

namespace TaskManager.Infrastructure.Data.Configurations;

public class TenantSettingsConfiguration : IEntityTypeConfiguration<TenantSettings>
{
    public void Configure(EntityTypeBuilder<TenantSettings> builder)
    {
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Timezone).IsRequired().HasMaxLength(100);
        builder.Property(s => s.DefaultWorkHoursPerDay).HasPrecision(4, 2);
        builder.Property(s => s.OverAllocationPolicy).HasConversion<string>().HasMaxLength(50);
        builder.Property(s => s.AiApprovalMode).HasConversion<string>().HasMaxLength(50);
        builder.Property(s => s.AiConfidenceThreshold).HasPrecision(3, 2);
    }
}
