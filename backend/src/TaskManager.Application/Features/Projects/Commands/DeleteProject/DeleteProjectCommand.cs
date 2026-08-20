using MediatR;
using TaskManager.Application.Common.Exceptions;
using TaskManager.Domain.Entities.Financials;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Features.Projects.Commands.DeleteProject;

public record DeleteProjectCommand(Guid Id) : IRequest;

public class DeleteProjectHandler : IRequestHandler<DeleteProjectCommand>
{
    private readonly IUnitOfWork _unitOfWork;

    public DeleteProjectHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(DeleteProjectCommand request, CancellationToken cancellationToken)
    {
        var projectRepo = _unitOfWork.Repository<Project>();
        var project = await projectRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Project), request.Id);

        projectRepo.Remove(project);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
