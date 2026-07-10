using MediatR;
using TaskManager.Application.DTOs;

namespace TaskManager.Application.Features.Projects.Commands.CreateProject;

public record CreateProjectCommand(
    string Name,
    string? Description
) : IRequest<ProjectDto>;
