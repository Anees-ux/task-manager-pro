import apiClient from '@shared/api/apiClient';
import type {
  AiDecision,
  ReviewAiDecisionRequest,
  ResolveBlockerResponse,
  CapacitySnapshot,
} from '../types/intelligence.types';

export const intelligenceApi = {
  /** Retrieve Neural Decision Ledger history */
  getDecisionLedger: (targetEntityId?: string) =>
    apiClient
      .get<AiDecision[]>('/Intelligence/ai-decisions', { params: { targetEntityId } })
      .then((r) => r.data),

  /** Human-in-the-loop review of an AI decision */
  reviewDecision: (id: string, data: ReviewAiDecisionRequest) =>
    apiClient
      .post<AiDecision>(`/Intelligence/ai-decisions/${id}/review`, data)
      .then((r) => r.data),

  /** Ask Gemini 3.5 Flash + Pinecone Vector RAG to resolve developer blockers */
  resolveBlocker: (question: string) =>
    apiClient
      .post<ResolveBlockerResponse>('/Intelligence/resolve-blocker', { question })
      .then((r) => r.data),

  /** Retrieve Capacity Heatmap snapshots */
  getCapacityHeatmap: (startDate?: string, endDate?: string) =>
    apiClient
      .get<CapacitySnapshot[]>('/Intelligence/capacity-heatmap', {
        params: { startDate, endDate },
      })
      .then((r) => r.data),
};
