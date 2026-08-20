using FluentAssertions;
using Moq;
using System.Linq.Expressions;
using TaskManager.Application.Features.Tasks.Queries.GetAllTasks;
using TaskManager.Domain.Entities.Execution;
using TaskManager.Domain.Entities.Financials;
using TaskManager.Domain.Entities.Workforce;
using TaskManager.Domain.Enums;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Tests.Features;

public class GetAllTasksHandlerTests
{
    private readonly Mock<IUnitOfWork> _mockUow;
    private readonly Mock<IRepository<TaskItem>> _mockTaskRepo;
    private readonly Mock<IRepository<Project>> _mockProjectRepo;
    private readonly Mock<IRepository<User>> _mockUserRepo;
    private readonly GetAllTasksHandler _handler;
    private readonly Guid _tenantId = Guid.NewGuid();
    private readonly Guid _projectId = Guid.NewGuid();

    public GetAllTasksHandlerTests()
    {
        _mockUow = new Mock<IUnitOfWork>();
        _mockTaskRepo = new Mock<IRepository<TaskItem>>();
        _mockProjectRepo = new Mock<IRepository<Project>>();
        _mockUserRepo = new Mock<IRepository<User>>();

        _mockUow.Setup(u => u.Repository<TaskItem>()).Returns(_mockTaskRepo.Object);
        _mockUow.Setup(u => u.Repository<Project>()).Returns(_mockProjectRepo.Object);
        _mockUow.Setup(u => u.Repository<User>()).Returns(_mockUserRepo.Object);

        _mockProjectRepo.Setup(p => p.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Project> { Project.Create(_tenantId, "Project 1", null, "PRJ-01") });

        _mockUserRepo.Setup(u => u.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<User>());

        _handler = new GetAllTasksHandler(_mockUow.Object);
    }

    [Fact]
    public async Task Handle_ReturnsTasks()
    {
        // Arrange
        var t1 = TaskItem.Create(_tenantId, "Task 1", null, "TSK-01", _projectId, Priority.High, 2);
        var t2 = TaskItem.Create(_tenantId, "Task 2", null, "TSK-02", _projectId, Priority.Medium, 4);

        _mockTaskRepo.Setup(r => r.FindAsync(It.IsAny<Expression<Func<TaskItem, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<TaskItem> { t1, t2 });

        // Act
        var result = await _handler.Handle(new GetAllTasksQuery(), CancellationToken.None);

        // Assert
        result.Should().HaveCount(2);
        result.Select(t => t.Title).Should().Contain(new[] { "Task 1", "Task 2" });
    }
}
