namespace TaskManager.Domain.Enums;

public enum AiDecisionStatus
{
    /// <summary>Decision proposed but awaiting human review.</summary>
    Proposed = 0,

    /// <summary>Decision approved by a human reviewer.</summary>
    Approved = 1,

    /// <summary>Decision rejected by a human reviewer.</summary>
    Rejected = 2,

    /// <summary>Decision was auto-applied because confidence exceeded threshold.</summary>
    AutoApplied = 3,

    /// <summary>Decision expired before being reviewed.</summary>
    Expired = 4,

    /// <summary>Decision failed repeated reviews and is escalated for manual admin override.</summary>
    Escalated = 5
}
