namespace TaskManager.Domain.Enums;

public enum DependencyType
{
    /// <summary>Successor can't start until predecessor finishes.</summary>
    FinishToStart = 0,

    /// <summary>Successor can't start until predecessor starts.</summary>
    StartToStart = 1,

    /// <summary>Successor can't finish until predecessor finishes.</summary>
    FinishToFinish = 2,

    /// <summary>Successor can't finish until predecessor starts.</summary>
    StartToFinish = 3
}
