namespace TaskManager.Domain.Enums;

public enum CapacityStatus
{
    /// <summary>User has significant free capacity (&lt; 60%).</summary>
    Available = 0,

    /// <summary>User is optimally loaded (60-80%).</summary>
    Optimal = 1,

    /// <summary>User is approaching capacity limits (80-100%).</summary>
    Warning = 2,

    /// <summary>User is over-allocated (&gt; 100%).</summary>
    Overloaded = 3,

    /// <summary>User is on approved leave for this date.</summary>
    OnLeave = 4
}
