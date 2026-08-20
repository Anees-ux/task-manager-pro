using FluentValidation;

namespace TaskManager.Application.Features.Tasks.Commands.CreateTask;

public class CreateTaskValidator : AbstractValidator<CreateTaskCommand>
{
    public CreateTaskValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Task title is required.")
            .MaximumLength(300).WithMessage("Task title cannot exceed 300 characters.");

        RuleFor(x => x.TaskCode)
            .NotEmpty().WithMessage("Task code is required.")
            .MaximumLength(20).WithMessage("Task code cannot exceed 20 characters.");

        RuleFor(x => x.ProjectId)
            .NotEmpty().WithMessage("Valid project ID is required.");

        RuleFor(x => x.EstimatedHours)
            .GreaterThanOrEqualTo(0).WithMessage("Estimated hours cannot be negative.");
    }
}
