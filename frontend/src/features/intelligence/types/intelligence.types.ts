// ─── Autonomous Intelligence Types (Mirrors IntelligenceDto.cs) ─────────
import type {
  AiAgentType,
  AiDecisionAction,
  AiDecisionStatus,
  CapacityStatus,
} from '@shared/types/enums';

export interface AiDecision {
  id: string; // C# Guid
  agentType: AiAgentType;
  targetEntityType: string;
  targetEntityId: string;
  action: AiDecisionAction;
  contextSnapshot: string;
  reasoningChain: string;
  confidenceScore: number; // e.g. 0.94 -> 94%
  status: AiDecisionStatus;
  reviewedByUserId?: string | null;
  reviewNotes?: string | null;
  modelVersion: string;
  executionTimeMs: number;
  createdAtUtc: string;
  rejectionCount?: number;
}

export type AiDecisionLedgerDto = AiDecision;

export interface ReviewAiDecisionRequest {
  approve: boolean;
  reviewNotes?: string | null;
}

export interface ManualAssignEscalatedDecisionRequest {
  assigneeId: string;
  notes?: string | null;
}

export interface ResolveBlockerRequest {
  question: string;
}

export interface ResolveBlockerResponse {
  answer: string;
  references?: string[];
}

export interface BlockerMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  references?: string[];
  model?: string;
  latencyMs?: number;
}

export interface CapacitySnapshot {
  id: string;
  userId: string;
  userName: string | null;
  date: string;
  availableHours: number;
  allocatedHours: number;
  loggedHours: number;
  utilizationPercent: number;
  freeHours: number;
  heatStatus: CapacityStatus;
  lastCalculatedAtUtc: string;
}
