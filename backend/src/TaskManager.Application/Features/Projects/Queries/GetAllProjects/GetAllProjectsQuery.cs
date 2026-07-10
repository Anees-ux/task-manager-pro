using MediatR;
using TaskManager.Application.DTOs;

namespace TaskManager.Application.Features.Projects.Queries.GetAllProjects;

public record GetAllProjectsQuery : IRequest<IReadOnlyList<ProjectDto>>;
