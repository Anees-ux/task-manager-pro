using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Domain.Entities.Intelligence;

namespace TaskManager.Infrastructure.Data.Configurations;

public class RippleEffectLogConfiguration : IEntityTypeConfiguration<RippleEffectLog>
{
    public void Configure(EntityTypeBuilder<RippleEffectLog> builder)
    {
        builder.HasKey(r => r.Id);
        builder.Property(r => r.TriggerEvent).IsRequired().HasMaxLength(100);
        builder.Property(r => r.AffectedTasksJson).IsRequired();

        builder.HasIndex(r => r.TriggerTaskId);
        builder.HasIndex(r => new { r.TenantId, r.CreatedAtUtc });
    }
}
