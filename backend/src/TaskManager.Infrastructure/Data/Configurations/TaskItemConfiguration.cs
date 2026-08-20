using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Domain.Entities.Execution;

namespace TaskManager.Infrastructure.Data.Configurations;

public class TaskItemConfiguration : IEntityTypeConfiguration<TaskItem>
{
    public void Configure(EntityTypeBuilder<TaskItem> builder)
    {
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Title).IsRequired().HasMaxLength(300);
        builder.Property(t => t.Description).HasMaxLength(4000);
        builder.Property(t => t.TaskCode).IsRequired().HasMaxLength(20);
        builder.Property(t => t.Status).HasConversion<string>().HasMaxLength(50);
        builder.Property(t => t.Priority).HasConversion<string>().HasMaxLength(50);
        builder.Property(t => t.EstimatedHours).HasPrecision(8, 2);
        builder.Property(t => t.ActualHours).HasPrecision(8, 2);
        builder.Property(t => t.RequiredSkills).HasMaxLength(1000);
        builder.Property(t => t.Version).IsConcurrencyToken();

        // Unique task code per tenant
        builder.HasIndex(t => new { t.TenantId, t.TaskCode }).IsUnique();

        // Performance indexes
        builder.HasIndex(t => new { t.TenantId, t.Status });
        builder.HasIndex(t => new { t.TenantId, t.AssigneeId });
        builder.HasIndex(t => new { t.TenantId, t.ProjectId });

        // Relationships
        builder.HasOne(t => t.Assignee)
            .WithMany()
            .HasForeignKey(t => t.AssigneeId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(t => t.Reporter)
            .WithMany()
            .HasForeignKey(t => t.ReporterId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasMany(t => t.WorkLogs)
            .WithOne(w => w.Task!)
            .HasForeignKey(w => w.TaskId)
            .OnDelete(DeleteBehavior.Cascade);

        // Dependencies: This task is a predecessor to...
        builder.HasMany(t => t.DependenciesAsPredecessor)
            .WithOne(d => d.PredecessorTask!)
            .HasForeignKey(d => d.PredecessorTaskId)
            .OnDelete(DeleteBehavior.NoAction);

        // Dependencies: This task is a successor of...
        builder.HasMany(t => t.DependenciesAsSuccessor)
            .WithOne(d => d.SuccessorTask!)
            .HasForeignKey(d => d.SuccessorTaskId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}
