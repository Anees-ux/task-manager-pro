using Microsoft.EntityFrameworkCore;
using TaskManager.Application.Interfaces;
using TaskManager.Domain.Entities.Intelligence;
using TaskManager.Domain.Enums;
using TaskManager.Infrastructure.Data;

namespace TaskManager.Infrastructure.Services;

/// <summary>
/// Capacity Heatmap Engine — calculates and materializes per-user per-day capacity snapshots.
/// Reads from UserAvailability, TimeOffs, TaskItem assignments, and WorkLogs.
/// </summary>
public class CapacityCalculatorService : ICapacityCalculator
{
    private readonly AppDbContext _context;

    public CapacityCalculatorService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<CapacitySnapshot> CalculateForUserAsync(Guid userId, DateOnly date, CancellationToken cancellationToken = default)
    {
        var dayOfWeek = date.DayOfWeek;

        // 1. Get user's base availability for this day of week
        var availability = await _context.UserAvailabilities
            .FirstOrDefaultAsync(a => a.UserId == userId && a.DayOfWeek == dayOfWeek, cancellationToken);

        var baseHours = availability?.AvailableHours ?? 0;

        // 2. Check if user is on approved leave
        var isOnLeave = await _context.TimeOffs
            .AnyAsync(t => t.UserId == userId
                && t.Status == TimeOffStatus.Approved
                && t.StartDate <= date
                && t.EndDate >= date, cancellationToken);

        var availableHours = isOnLeave ? 0m : baseHours;

        // 3. Calculate allocated hours (sum of estimated hours from assigned active tasks)
        var allocatedHours = await _context.Tasks
            .Where(t => t.AssigneeId == userId
                && t.Status != TaskItemStatus.Done
                && t.Status != TaskItemStatus.Cancelled)
            .SumAsync(t => t.EstimatedHours, cancellationToken);

        // 4. Calculate logged hours for this date
        var loggedHours = await _context.WorkLogs
            .Where(w => w.UserId == userId && w.LogDate == date)
            .SumAsync(w => w.HoursWorked, cancellationToken);

        // 5. Get user's TenantId
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
        var tenantId = user?.TenantId ?? Guid.Empty;

        return CapacitySnapshot.Create(tenantId, userId, date, availableHours, allocatedHours, loggedHours);
    }

    public async Task<IReadOnlyList<CapacitySnapshot>> CalculateForTeamAsync(
        DateOnly startDate, DateOnly endDate, CancellationToken cancellationToken = default)
    {
        var users = await _context.Users
            .Where(u => u.IsActive)
            .Select(u => u.Id)
            .ToListAsync(cancellationToken);

        var snapshots = new List<CapacitySnapshot>();

        for (var date = startDate; date <= endDate; date = date.AddDays(1))
        {
            foreach (var userId in users)
            {
                var snapshot = await CalculateForUserAsync(userId, date, cancellationToken);
                snapshots.Add(snapshot);
            }
        }

        return snapshots.AsReadOnly();
    }

    public async Task RecalculateAndPersistAsync(Guid userId, DateOnly date, CancellationToken cancellationToken = default)
    {
        var newSnapshot = await CalculateForUserAsync(userId, date, cancellationToken);

        var existing = await _context.CapacitySnapshots
            .FirstOrDefaultAsync(c => c.UserId == userId && c.Date == date, cancellationToken);

        if (existing != null)
        {
            existing.Recalculate(newSnapshot.AvailableHours, newSnapshot.AllocatedHours, newSnapshot.LoggedHours);
        }
        else
        {
            await _context.CapacitySnapshots.AddAsync(newSnapshot, cancellationToken);
        }

        await _context.SaveChangesAsync(cancellationToken);
    }
}
