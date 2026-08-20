namespace TaskManager.Domain.Enums;

public enum AiApprovalMode
{
    /// <summary>AI decisions are auto-applied when confidence exceeds threshold.</summary>
    AutoApply = 0,

    /// <summary>All AI decisions require manual human approval.</summary>
    RequireApproval = 1
}
