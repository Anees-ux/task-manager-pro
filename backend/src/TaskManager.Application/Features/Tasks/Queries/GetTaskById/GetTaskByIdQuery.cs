using MediatR;
using TaskManager.Application.DTOs;

namespace TaskManager.Application.Features.Tasks.Queries.GetTaskById;

public record GetTaskByIdQuery(int Id) : IRequest<TaskItemDto>;
