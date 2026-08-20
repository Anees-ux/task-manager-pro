using TaskManager.Domain.Enums;

namespace TaskManager.Application.DTOs;

public record CapacitySnapshotDto(
    Guid Id,
    Guid UserId,
    string? UserName,
    DateOnly Date,
    decimal AvailableHours,
    decimal AllocatedHours,
    decimal LoggedHours,
    decimal UtilizationPercent,
    decimal FreeHours,
    CapacityStatus HeatStatus,
    DateTime LastCalculatedAtUtc
);

public record AiDecisionLedgerDto(
    Guid Id,
    AiAgentType AgentType,
    string TargetEntityType,
    Guid TargetEntityId,
    AiDecisionAction Action,
    string ContextSnapshot,
    string ReasoningChain,
    float ConfidenceScore,
    AiDecisionStatus Status,
    Guid? ReviewedByUserId,
    string? ReviewNotes,
    string ModelVersion,
    int ExecutionTimeMs,
    DateTime CreatedAtUtc,
    int RejectionCount = 0
);

public record ReviewAiDecisionRequest(
    bool Approve,
    string? ReviewNotes
);

public record RippleEffectLogDto(
    Guid Id,
    Guid TriggerTaskId,
    string TriggerEvent,
    string AffectedTasksJson,
    int TotalTasksAffected,
    DateTime CreatedAtUtc
);

public record ResolveBlockerRequest(
    string Question
);

public record ResolveBlockerResponse(
    string Answer
);
