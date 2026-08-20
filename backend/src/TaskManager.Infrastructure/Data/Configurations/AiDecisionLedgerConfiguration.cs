using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Domain.Entities.Intelligence;

namespace TaskManager.Infrastructure.Data.Configurations;

public class AiDecisionLedgerConfiguration : IEntityTypeConfiguration<AiDecisionLedger>
{
    public void Configure(EntityTypeBuilder<AiDecisionLedger> builder)
    {
        builder.HasKey(d => d.Id);
        builder.Property(d => d.AgentType).HasConversion<string>().HasMaxLength(50);
        builder.Property(d => d.TargetEntityType).IsRequired().HasMaxLength(100);
        builder.Property(d => d.Action).HasConversion<string>().HasMaxLength(50);
        builder.Property(d => d.ContextSnapshot).IsRequired();
        builder.Property(d => d.ReasoningChain).IsRequired();
        builder.Property(d => d.Status).HasConversion<string>().HasMaxLength(50);
        builder.Property(d => d.ModelVersion).IsRequired().HasMaxLength(100);
        builder.Property(d => d.ReviewNotes).HasMaxLength(2000);

        // Performance indexes for querying AI history
        builder.HasIndex(d => new { d.TenantId, d.Status });
        builder.HasIndex(d => new { d.TenantId, d.AgentType });
        builder.HasIndex(d => new { d.TargetEntityType, d.TargetEntityId });
    }
}
