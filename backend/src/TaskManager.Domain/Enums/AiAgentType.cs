namespace TaskManager.Domain.Enums;

public enum AiAgentType
{
    /// <summary>Routes tasks to the best available team member.</summary>
    TaskRouter = 0,

    /// <summary>Automatically updates task statuses based on activity.</summary>
    StatusAgent = 1,

    /// <summary>Optimizes team capacity and flags over-allocation.</summary>
    CapacityOptimizer = 2,

    /// <summary>Analyzes dependency cascades and deadline impacts.</summary>
    RippleAnalyzer = 3,

    /// <summary>Resolves blockers using RAG + past task knowledge.</summary>
    BlockerResolver = 4
}
