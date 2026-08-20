using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Domain.Entities.Workspace;

namespace TaskManager.Infrastructure.Data.Configurations;

public class TenantConfiguration : IEntityTypeConfiguration<Tenant>
{
    public void Configure(EntityTypeBuilder<Tenant> builder)
    {
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Name).IsRequired().HasMaxLength(200);
        builder.Property(t => t.Slug).IsRequired().HasMaxLength(100);
        builder.HasIndex(t => t.Slug).IsUnique();
        builder.Property(t => t.Tier).HasConversion<string>().HasMaxLength(50);
        builder.Property(t => t.Version).IsConcurrencyToken();

        builder.HasOne(t => t.Settings)
            .WithOne(s => s!.Tenant!)
            .HasForeignKey<TenantSettings>(s => s.TenantRefId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
