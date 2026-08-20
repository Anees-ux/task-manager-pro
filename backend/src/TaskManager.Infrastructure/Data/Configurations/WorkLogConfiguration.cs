using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Domain.Entities.Execution;

namespace TaskManager.Infrastructure.Data.Configurations;

public class WorkLogConfiguration : IEntityTypeConfiguration<WorkLog>
{
    public void Configure(EntityTypeBuilder<WorkLog> builder)
    {
        builder.HasKey(w => w.Id);
        builder.Property(w => w.HoursWorked).HasPrecision(6, 2);
        builder.Property(w => w.Description).HasMaxLength(1000);

        // Performance index for daily capacity queries
        builder.HasIndex(w => new { w.UserId, w.LogDate });
        builder.HasIndex(w => new { w.TaskId, w.LogDate });

        builder.HasOne(w => w.User)
            .WithMany()
            .HasForeignKey(w => w.UserId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}
