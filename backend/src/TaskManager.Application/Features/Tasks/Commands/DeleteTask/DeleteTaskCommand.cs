using MediatR;
using TaskManager.Application.Common.Exceptions;
using TaskManager.Domain.Entities.Execution;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Features.Tasks.Commands.DeleteTask;

public record DeleteTaskCommand(Guid Id) : IRequest;

public class DeleteTaskHandler : IRequestHandler<DeleteTaskCommand>
{
    private readonly IUnitOfWork _unitOfWork;

    public DeleteTaskHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(DeleteTaskCommand request, CancellationToken cancellationToken)
    {
        var taskRepo = _unitOfWork.Repository<TaskItem>();
        var task = await taskRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(TaskItem), request.Id);

        taskRepo.Remove(task);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
