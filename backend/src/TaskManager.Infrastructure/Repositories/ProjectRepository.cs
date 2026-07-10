using Microsoft.EntityFrameworkCore;
using TaskManager.Domain.Entities;
using TaskManager.Infrastructure.Data;

namespace TaskManager.Infrastructure.Repositories;

/// <summary>
/// Specialized repository for Project that includes Tasks navigation property.
/// </summary>
public class ProjectRepository : Repository<Project>
{
    public ProjectRepository(AppDbContext context) : base(context) { }

    public new async Task<IReadOnlyList<Project>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(p => p.Tasks)
            .OrderBy(p => p.Name)
            .ToListAsync(cancellationToken);
    }
}
