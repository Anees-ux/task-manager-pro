namespace TaskManager.Domain.Enums;

public enum AiDecisionAction
{
    Assign = 0,
    Reassign = 1,
    StatusChange = 2,
    DeadlineShift = 3,
    CapacityWarning = 4,
    BlockerFlag = 5
}
