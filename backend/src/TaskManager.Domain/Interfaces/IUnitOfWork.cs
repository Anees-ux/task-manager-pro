using TaskManager.Domain.Common;

namespace TaskManager.Domain.Interfaces;

/// <summary>
/// Unit of Work pattern — coordinates transactional consistency across multiple repositories.
/// All domain operations within a single use case share one UoW instance.
/// SaveChangesAsync commits all pending changes atomically.
/// </summary>
public interface IUnitOfWork : IDisposable
{
    /// <summary>
    /// Gets a repository for the specified entity type.
    /// Repositories are lazily created and cached per UoW instance.
    /// </summary>
    IRepository<T> Repository<T>() where T : BaseEntity;

    /// <summary>
    /// Persists all pending changes to the database atomically.
    /// Also dispatches domain events collected from aggregate roots.
    /// </summary>
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);

    /// <summary>Begins an explicit database transaction.</summary>
    Task BeginTransactionAsync(CancellationToken cancellationToken = default);

    /// <summary>Commits the current transaction.</summary>
    Task CommitTransactionAsync(CancellationToken cancellationToken = default);

    /// <summary>Rolls back the current transaction.</summary>
    Task RollbackTransactionAsync(CancellationToken cancellationToken = default);
}
