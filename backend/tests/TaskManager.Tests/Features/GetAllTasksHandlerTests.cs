using FluentAssertions;
using Moq;
using TaskManager.Application.Features.Tasks.Queries.GetAllTasks;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Enums;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Tests.Features;

public class GetAllTasksHandlerTests
{
    private readonly Mock<IRepository<TaskItem>> _mockRepository;
    private readonly GetAllTasksHandler _handler;

    public GetAllTasksHandlerTests()
    {
        _mockRepository = new Mock<IRepository<TaskItem>>();
        _handler = new GetAllTasksHandler(_mockRepository.Object);
    }

    [Fact]
    public async Task Handle_NoFilters_ReturnsAllTasks()
    {
        // Arrange
        var tasks = new List<TaskItem>
        {
            new() { Id = 1, Title = "Task 1", Status = TaskItemStatus.Todo, Priority = Priority.High, ProjectId = 1, CreatedAt = DateTime.UtcNow, Project = new Project { Id = 1, Name = "Project 1" } },
            new() { Id = 2, Title = "Task 2", Status = TaskItemStatus.InProgress, Priority = Priority.Medium, ProjectId = 1, CreatedAt = DateTime.UtcNow, Project = new Project { Id = 1, Name = "Project 1" } },
            new() { Id = 3, Title = "Task 3", Status = TaskItemStatus.Done, Priority = Priority.Low, ProjectId = 2, CreatedAt = DateTime.UtcNow, Project = new Project { Id = 2, Name = "Project 2" } }
        };

        _mockRepository.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(tasks.AsReadOnly());

        // Act
        var result = await _handler.Handle(new GetAllTasksQuery(), CancellationToken.None);

        // Assert
        result.Should().HaveCount(3);
    }

    [Fact]
    public async Task Handle_StatusFilter_ReturnsFilteredTasks()
    {
        // Arrange
        var tasks = new List<TaskItem>
        {
            new() { Id = 1, Title = "Task 1", Status = TaskItemStatus.Todo, Priority = Priority.High, ProjectId = 1, CreatedAt = DateTime.UtcNow, Project = new Project { Id = 1, Name = "Project 1" } },
            new() { Id = 2, Title = "Task 2", Status = TaskItemStatus.InProgress, Priority = Priority.Medium, ProjectId = 1, CreatedAt = DateTime.UtcNow, Project = new Project { Id = 1, Name = "Project 1" } },
            new() { Id = 3, Title = "Task 3", Status = TaskItemStatus.Todo, Priority = Priority.Low, ProjectId = 2, CreatedAt = DateTime.UtcNow, Project = new Project { Id = 2, Name = "Project 2" } }
        };

        _mockRepository.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(tasks.AsReadOnly());

        // Act
        var result = await _handler.Handle(new GetAllTasksQuery(Status: TaskItemStatus.Todo), CancellationToken.None);

        // Assert
        result.Should().HaveCount(2);
        result.Should().OnlyContain(t => t.Status == TaskItemStatus.Todo);
    }

    [Fact]
    public async Task Handle_PriorityFilter_ReturnsFilteredTasks()
    {
        // Arrange
        var tasks = new List<TaskItem>
        {
            new() { Id = 1, Title = "Task 1", Status = TaskItemStatus.Todo, Priority = Priority.High, ProjectId = 1, CreatedAt = DateTime.UtcNow, Project = new Project { Id = 1, Name = "Project 1" } },
            new() { Id = 2, Title = "Task 2", Status = TaskItemStatus.InProgress, Priority = Priority.Medium, ProjectId = 1, CreatedAt = DateTime.UtcNow, Project = new Project { Id = 1, Name = "Project 1" } }
        };

        _mockRepository.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(tasks.AsReadOnly());

        // Act
        var result = await _handler.Handle(new GetAllTasksQuery(Priority: Priority.High), CancellationToken.None);

        // Assert
        result.Should().HaveCount(1);
        result.First().Priority.Should().Be(Priority.High);
    }
}
