using FluentAssertions;
using Moq;
using System.Linq.Expressions;
using TaskManager.Application.Features.Tasks.Commands.CreateTask;
using TaskManager.Application.Interfaces;
using TaskManager.Domain.Entities.Execution;
using TaskManager.Domain.Entities.Financials;
using TaskManager.Domain.Enums;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Tests.Features;

public class CreateTaskHandlerTests
{
    private readonly Mock<IUnitOfWork> _mockUow;
    private readonly Mock<ITenantService> _mockTenantService;
    private readonly Mock<IRepository<TaskItem>> _mockTaskRepo;
    private readonly Mock<IRepository<Project>> _mockProjectRepo;
    private readonly CreateTaskHandler _handler;
    private readonly Guid _tenantId = Guid.NewGuid();
    private readonly Guid _projectId = Guid.NewGuid();

    public CreateTaskHandlerTests()
    {
        _mockUow = new Mock<IUnitOfWork>();
        _mockTenantService = new Mock<ITenantService>();
        _mockTaskRepo = new Mock<IRepository<TaskItem>>();
        _mockProjectRepo = new Mock<IRepository<Project>>();

        _mockTenantService.Setup(t => t.GetCurrentTenantId()).Returns(_tenantId);
        _mockTenantService.Setup(t => t.GetCurrentUserId()).Returns(Guid.NewGuid().ToString());

        _mockUow.Setup(u => u.Repository<TaskItem>()).Returns(_mockTaskRepo.Object);
        _mockUow.Setup(u => u.Repository<Project>()).Returns(_mockProjectRepo.Object);

        var project = Project.Create(_tenantId, "Test Project", "Desc", "PRJ-01");
        _mockProjectRepo.Setup(p => p.GetByIdAsync(_projectId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(project);

        _handler = new CreateTaskHandler(_mockUow.Object, _mockTenantService.Object);
    }

    [Fact]
    public async Task Handle_ValidCommand_ReturnsCreatedTaskDto()
    {
        // Arrange
        var command = new CreateTaskCommand(
            Title: "Test Task",
            Description: "Test Description",
            TaskCode: "TSK-001",
            ProjectId: _projectId,
            Priority: Priority.High,
            EstimatedHours: 4.5m,
            DueDateUtc: DateTime.UtcNow.AddDays(7)
        );

        _mockTaskRepo.Setup(r => r.AnyAsync(It.IsAny<Expression<Func<TaskItem, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Title.Should().Be("Test Task");
        result.TaskCode.Should().Be("TSK-001");
        result.Description.Should().Be("Test Description");
        result.Status.Should().Be(TaskItemStatus.Backlog);
        result.Priority.Should().Be(Priority.High);
        result.EstimatedHours.Should().Be(4.5m);
        result.ProjectId.Should().Be(_projectId);

        _mockTaskRepo.Verify(r => r.AddAsync(It.IsAny<TaskItem>(), It.IsAny<CancellationToken>()), Times.Once);
        _mockUow.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
