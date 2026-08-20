import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { intelligenceApi } from '../api/intelligenceApi';
import type { ReviewAiDecisionRequest } from '../types/intelligence.types';
import toast from 'react-hot-toast';

export const INTELLIGENCE_KEYS = {
  all: ['intelligence'] as const,
  decisions: (targetEntityId?: string) =>
    [...INTELLIGENCE_KEYS.all, 'decisions', targetEntityId] as const,
  heatmap: (startDate?: string, endDate?: string) =>
    [...INTELLIGENCE_KEYS.all, 'heatmap', startDate, endDate] as const,
};

/**
 * Hook to retrieve the Neural Decision Ledger audit trail.
 */
export function useDecisionLedger(targetEntityId?: string) {
  return useQuery({
    queryKey: INTELLIGENCE_KEYS.decisions(targetEntityId),
    queryFn: () => intelligenceApi.getDecisionLedger(targetEntityId),
  });
}

/**
 * Hook to review an autonomous AI decision.
 */
export function useReviewDecision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReviewAiDecisionRequest }) =>
      intelligenceApi.reviewDecision(id, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: INTELLIGENCE_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['workforce'] });
      toast.success(
        result.status === 'Approved'
          ? 'AI Decision Approved & Enforced ✅'
          : 'AI Decision Rejected ❌'
      );
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to review AI decision.';
      toast.error(typeof msg === 'string' ? msg : 'Error processing review.');
    },
  });
}

/**
 * Hook to resolve blockers using Pinecone Vector RAG + Google Gemini.
 */
export function useResolveBlocker() {
  return useMutation({
    mutationFn: (question: string) => intelligenceApi.resolveBlocker(question),
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data ||
        'Failed to synthesize resolution from Pinecone Vector RAG.';
      toast.error(typeof msg === 'string' ? msg : 'Error querying AI engine.');
    },
  });
}

/**
 * Hook to retrieve capacity heatmap predictions.
 */
export function useCapacityHeatmap(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: INTELLIGENCE_KEYS.heatmap(startDate, endDate),
    queryFn: () => intelligenceApi.getCapacityHeatmap(startDate, endDate),
  });
}
