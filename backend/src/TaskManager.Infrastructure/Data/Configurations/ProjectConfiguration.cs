using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Domain.Entities.Financials;

namespace TaskManager.Infrastructure.Data.Configurations;

public class ProjectConfiguration : IEntityTypeConfiguration<Project>
{
    public void Configure(EntityTypeBuilder<Project> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Name).IsRequired().HasMaxLength(200);
        builder.Property(p => p.Description).HasMaxLength(2000);
        builder.Property(p => p.ProjectCode).IsRequired().HasMaxLength(20);
        builder.Property(p => p.Status).HasConversion<string>().HasMaxLength(50);
        builder.Property(p => p.BudgetAllocated).HasPrecision(18, 2);
        builder.Property(p => p.BudgetConsumed).HasPrecision(18, 2);
        builder.Property(p => p.Version).IsConcurrencyToken();
        builder.Ignore(p => p.BudgetUtilizationPercent); // Computed property, not mapped

        // Unique project code per tenant
        builder.HasIndex(p => new { p.TenantId, p.ProjectCode }).IsUnique();

        // Relationships
        builder.HasOne(p => p.ProjectManager)
            .WithMany()
            .HasForeignKey(p => p.ProjectManagerId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(p => p.Tasks)
            .WithOne(t => t.Project!)
            .HasForeignKey(t => t.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
