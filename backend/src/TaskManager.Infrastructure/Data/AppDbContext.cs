using Microsoft.EntityFrameworkCore;
using TaskManager.Domain.Entities;

namespace TaskManager.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<TaskItem> Tasks => Set<TaskItem>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply all configurations from this assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        // Seed default projects
        modelBuilder.Entity<Project>().HasData(
            new Project { Id = 1, Name = "Frontend App", Description = "React frontend application", CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Project { Id = 2, Name = "Backend API", Description = "ASP.NET Core Web API", CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Project { Id = 3, Name = "DevOps", Description = "CI/CD and infrastructure", CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
        );

        // Seed sample tasks
        modelBuilder.Entity<TaskItem>().HasData(
            new TaskItem { Id = 1, Title = "Design login page", Description = "Create a modern login page with form validation", Status = Domain.Enums.TaskItemStatus.Done, Priority = Domain.Enums.Priority.High, ProjectId = 1, CreatedAt = new DateTime(2024, 1, 2, 0, 0, 0, DateTimeKind.Utc) },
            new TaskItem { Id = 2, Title = "Setup API authentication", Description = "Implement JWT authentication flow", Status = Domain.Enums.TaskItemStatus.InProgress, Priority = Domain.Enums.Priority.High, ProjectId = 2, DueDate = new DateTime(2024, 7, 15, 0, 0, 0, DateTimeKind.Utc), CreatedAt = new DateTime(2024, 1, 3, 0, 0, 0, DateTimeKind.Utc) },
            new TaskItem { Id = 3, Title = "Create task list component", Description = "Build reusable task list with filters", Status = Domain.Enums.TaskItemStatus.Todo, Priority = Domain.Enums.Priority.Medium, ProjectId = 1, DueDate = new DateTime(2024, 7, 20, 0, 0, 0, DateTimeKind.Utc), CreatedAt = new DateTime(2024, 1, 4, 0, 0, 0, DateTimeKind.Utc) },
            new TaskItem { Id = 4, Title = "Configure Docker deployment", Description = "Set up Docker containers for production", Status = Domain.Enums.TaskItemStatus.Todo, Priority = Domain.Enums.Priority.Low, ProjectId = 3, CreatedAt = new DateTime(2024, 1, 5, 0, 0, 0, DateTimeKind.Utc) },
            new TaskItem { Id = 5, Title = "Write API documentation", Description = "Document all API endpoints using Swagger", Status = Domain.Enums.TaskItemStatus.InProgress, Priority = Domain.Enums.Priority.Medium, ProjectId = 2, DueDate = new DateTime(2024, 7, 10, 0, 0, 0, DateTimeKind.Utc), CreatedAt = new DateTime(2024, 1, 6, 0, 0, 0, DateTimeKind.Utc) }
        );
    }
}
