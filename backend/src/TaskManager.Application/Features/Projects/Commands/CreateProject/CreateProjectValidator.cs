using FluentValidation;

namespace TaskManager.Application.Features.Projects.Commands.CreateProject;

public class CreateProjectValidator : AbstractValidator<CreateProjectCommand>
{
    public CreateProjectValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Project name is required.")
            .MaximumLength(200).WithMessage("Project name cannot exceed 200 characters.");

        RuleFor(x => x.ProjectCode)
            .NotEmpty().WithMessage("Project code is required.")
            .MaximumLength(20).WithMessage("Project code cannot exceed 20 characters.");

        RuleFor(x => x.BudgetAllocated)
            .GreaterThanOrEqualTo(0).WithMessage("Budget cannot be negative.");
    }
}
