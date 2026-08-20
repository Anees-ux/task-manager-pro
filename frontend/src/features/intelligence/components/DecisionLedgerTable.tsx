import React, { useState } from 'react';
import type { AiDecision } from '../types/intelligence.types';
import { useReviewDecision } from '../hooks/useIntelligence';
import { formatDate } from '@shared/lib/dateUtils';
import {
  IconCpu,
  IconClock,
  IconCheck,
  IconX,
  IconChevronDown,
  IconChevronUp,
  IconBrain,
} from '@tabler/icons-react';

interface DecisionLedgerTableProps {
  decisions: AiDecision[];
}

export function DecisionLedgerTable({ decisions }: DecisionLedgerTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const reviewMutation = useReviewDecision();

  const handleReview = (id: string, approve: boolean) => {
    reviewMutation.mutate({ id, data: { approve, reviewNotes: approve ? 'Verified by Tech Lead' : 'Overridden manually' } });
  };

  const getConfidenceBadge = (rawScore: number) => {
    const score = rawScore <= 1 ? Math.round(rawScore * 100) : Math.round(rawScore);

    if (score >= 90) {
      return (
        <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1 rounded-pill small fw-bold d-inline-flex align-items-center gap-1">
          <span className="p-1 rounded-circle bg-success d-inline-block shadow-sm" style={{ width: '6px', height: '6px' }} />
          {score}% Confidence
        </span>
      );
    }
    if (score >= 80) {
      return (
        <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2.5 py-1 rounded-pill small fw-bold d-inline-flex align-items-center gap-1">
          {score}% Confidence
        </span>
      );
    }
    return (
      <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-2.5 py-1 rounded-pill small fw-bold d-inline-flex align-items-center gap-1">
        {score}% Review Advised
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
      case 'Applied':
        return (
          <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-0.5 rounded-pill small">
            {status}
          </span>
        );
      case 'Rejected':
        return (
          <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-0.5 rounded-pill small">
            Rejected
          </span>
        );
      default:
        return (
          <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-2 py-0.5 rounded-pill small">
            Pending Review
          </span>
        );
    }
  };

  return (
    <div className="card glass-surface p-0 overflow-hidden shadow-sm border-0">
      <div className="table-responsive">
        <table className="table table-vcenter table-hover card-table m-0 text-nowrap">
          <thead>
            <tr className="bg-body-tertiary border-bottom border-secondary-subtle">
              <th className="text-secondary small fw-bold text-uppercase py-3 ps-4" style={{ fontSize: '0.675rem', letterSpacing: '0.06em' }}>
                AI Autonomous Agent
              </th>
              <th className="text-secondary small fw-bold text-uppercase py-3" style={{ fontSize: '0.675rem', letterSpacing: '0.06em' }}>
                Action Executed
              </th>
              <th className="text-secondary small fw-bold text-uppercase py-3" style={{ fontSize: '0.675rem', letterSpacing: '0.06em' }}>
                Model & Latency
              </th>
              <th className="text-secondary small fw-bold text-uppercase py-3 text-center" style={{ fontSize: '0.675rem', letterSpacing: '0.06em' }}>
                Confidence Score
              </th>
              <th className="text-secondary small fw-bold text-uppercase py-3" style={{ fontSize: '0.675rem', letterSpacing: '0.06em' }}>
                Status
              </th>
              <th className="text-secondary small fw-bold text-uppercase py-3 pe-4 text-end" style={{ fontSize: '0.675rem', letterSpacing: '0.06em' }}>
                Human-In-The-Loop
              </th>
            </tr>
          </thead>
          <tbody>
            {decisions.map((decision) => {
              const isExpanded = expandedId === decision.id;

              return (
                <React.Fragment key={decision.id}>
                  <tr className="transition-fast border-bottom border-secondary-subtle">
                    {/* Agent Type */}
                    <td className="py-3.5 ps-4">
                      <div className="d-flex align-items-center gap-2.5">
                        <div className="p-2 rounded-3 bg-purple-subtle text-purple border border-purple-subtle flex-shrink-0">
                          <IconCpu size={16} />
                        </div>
                        <div>
                          <div className="fw-semibold text-body small">{decision.agentType || 'TaskRouter'}</div>
                          <div className="text-muted small font-monospace" style={{ fontSize: '0.68rem' }}>
                            ID: {decision.id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Action Executed */}
                    <td className="py-3.5">
                      <span className="badge bg-body-secondary text-body border border-secondary-subtle px-2 py-1 rounded small fw-medium">
                        {decision.action}
                      </span>
                    </td>

                    {/* Model & Latency */}
                    <td className="py-3.5">
                      <div className="small text-body fw-medium font-monospace" style={{ fontSize: '0.75rem' }}>
                        {decision.modelVersion || 'gemini-3.5-flash'}
                      </div>
                      <div className="text-muted small d-flex align-items-center gap-1" style={{ fontSize: '0.68rem' }}>
                        <IconClock size={11} />
                        <span>{decision.executionTimeMs || 120}ms</span>
                      </div>
                    </td>

                    {/* Confidence Score (Highlighted) */}
                    <td className="py-3.5 text-center">
                      {getConfidenceBadge(decision.confidenceScore)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5">{getStatusBadge(decision.status)}</td>

                    {/* Human Review Controls */}
                    <td className="py-3.5 pe-4 text-end">
                      <div className="d-inline-flex align-items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setExpandedId(isExpanded ? null : decision.id)}
                          className="btn btn-sm btn-ghost-secondary px-2 py-1 rounded-2"
                          title="View Reasoning Chain"
                        >
                          <span className="small me-1">Reasoning</span>
                          {isExpanded ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
                        </button>

                        {(!['Approved', 'Applied', 'Rejected'].includes(decision.status)) && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleReview(decision.id, true)}
                              className="btn btn-sm btn-outline-success px-2 py-1 rounded-2"
                              title="Approve Decision"
                              disabled={reviewMutation.isPending}
                            >
                              <IconCheck size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReview(decision.id, false)}
                              className="btn btn-sm btn-outline-danger px-2 py-1 rounded-2"
                              title="Reject Decision"
                              disabled={reviewMutation.isPending}
                            >
                              <IconX size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Expandable Reasoning Chain Row */}
                  {isExpanded && (
                    <tr className="bg-body-secondary border-bottom border-secondary-subtle">
                      <td colSpan={6} className="p-4">
                        <div className="p-3 rounded-3 bg-body border border-secondary-subtle">
                          <div className="d-flex align-items-center gap-2 mb-2 text-purple small fw-bold">
                            <IconBrain size={16} />
                            <span>Neural Reasoning Chain & Provenance Snapshot:</span>
                          </div>
                          <p className="text-body small mb-2 lh-base" style={{ fontSize: '0.825rem' }}>
                            {decision.reasoningChain ||
                              'AI matched task requirements against engineering skill proficiencies, historical velocity, and capacity headroom.'}
                          </p>
                          {decision.contextSnapshot && (
                            <div className="p-2 rounded bg-body-tertiary font-monospace text-secondary small" style={{ fontSize: '0.72rem' }}>
                              {decision.contextSnapshot}
                            </div>
                          )}
                          <div className="text-muted small mt-2 d-flex align-items-center justify-content-between" style={{ fontSize: '0.7rem' }}>
                            <span>Timestamp: {formatDate(decision.createdAtUtc, 'MMM dd, yyyy HH:mm:ss')}</span>
                            {decision.reviewNotes && <span>Review Note: {decision.reviewNotes}</span>}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
