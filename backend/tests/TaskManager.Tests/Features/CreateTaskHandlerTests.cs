using FluentAssertions;
using Moq;
using TaskManager.Application.Features.Tasks.Commands.CreateTask;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Enums;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Tests.Features;

public class CreateTaskHandlerTests
{
    private readonly Mock<IRepository<TaskItem>> _mockRepository;
    private readonly CreateTaskHandler _handler;

    public CreateTaskHandlerTests()
    {
        _mockRepository = new Mock<IRepository<TaskItem>>();
        _handler = new CreateTaskHandler(_mockRepository.Object);
    }

    [Fact]
    public async Task Handle_ValidCommand_ReturnsCreatedTaskDto()
    {
        // Arrange
        var command = new CreateTaskCommand(
            Title: "Test Task",
            Description: "Test Description",
            Status: TaskItemStatus.Todo,
            Priority: Priority.High,
            ProjectId: 1,
            DueDate: DateTime.UtcNow.AddDays(7)
        );

        _mockRepository.Setup(r => r.AddAsync(It.IsAny<TaskItem>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((TaskItem task, CancellationToken _) =>
            {
                task.Id = 1;
                return task;
            });

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(1);
        result.Title.Should().Be("Test Task");
        result.Description.Should().Be("Test Description");
        result.Status.Should().Be(TaskItemStatus.Todo);
        result.Priority.Should().Be(Priority.High);
        result.ProjectId.Should().Be(1);

        _mockRepository.Verify(r => r.AddAsync(It.IsAny<TaskItem>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ValidCommand_SetsCreatedAtToUtcNow()
    {
        // Arrange
        var beforeTime = DateTime.UtcNow;
        var command = new CreateTaskCommand(
            Title: "Time Test Task",
            Description: null,
            Status: TaskItemStatus.InProgress,
            Priority: Priority.Medium,
            ProjectId: 2,
            DueDate: null
        );

        _mockRepository.Setup(r => r.AddAsync(It.IsAny<TaskItem>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((TaskItem task, CancellationToken _) =>
            {
                task.Id = 2;
                return task;
            });

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);
        var afterTime = DateTime.UtcNow;

        // Assert
        result.CreatedAt.Should().BeOnOrAfter(beforeTime);
        result.CreatedAt.Should().BeOnOrBefore(afterTime);
    }
}
