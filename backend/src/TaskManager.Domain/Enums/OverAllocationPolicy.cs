namespace TaskManager.Domain.Enums;

public enum OverAllocationPolicy
{
    /// <summary>Show a warning but allow the assignment.</summary>
    Warn = 0,

    /// <summary>Block the assignment if user capacity is exceeded.</summary>
    Block = 1,

    /// <summary>Allow over-allocation without any warning.</summary>
    Allow = 2
}
