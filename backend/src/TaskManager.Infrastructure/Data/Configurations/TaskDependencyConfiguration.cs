using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Domain.Entities.Execution;

namespace TaskManager.Infrastructure.Data.Configurations;

public class TaskDependencyConfiguration : IEntityTypeConfiguration<TaskDependency>
{
    public void Configure(EntityTypeBuilder<TaskDependency> builder)
    {
        builder.HasKey(d => d.Id);
        builder.Property(d => d.Type).HasConversion<string>().HasMaxLength(50);

        // Prevent duplicate dependency links
        builder.HasIndex(d => new { d.PredecessorTaskId, d.SuccessorTaskId }).IsUnique();
    }
}
