import React from 'react';
import { useFormContext } from 'react-hook-form';
import { AiApprovalMode } from '@shared/types/enums';
import {
  IconBrain,
  IconSparkles,
  IconCpu,
  IconShieldLock,
  IconFlame,
} from '@tabler/icons-react';

export function AiEngineSettings() {
  const { register, watch } = useFormContext();

  const autoAssign = watch('aiAutoAssignEnabled');
  const confidenceThreshold = watch('aiConfidenceThreshold') ?? 0.85;
  const thresholdPercent = Math.round(Number(confidenceThreshold) * 100);

  return (
    <div className="card glass-surface p-4 p-md-5 shadow-sm border-0">
      <div className="d-flex align-items-center gap-2.5 mb-4 pb-3 border-bottom border-secondary-subtle">
        <div className="p-2 rounded-3 bg-purple-subtle text-purple border border-purple-subtle">
          <IconBrain size={20} />
        </div>
        <div>
          <h3 className="h4 fw-bold text-body mb-0">Autonomous AI Engine Governance</h3>
          <p className="text-secondary small mb-0">
            Configure automated task assignment, vector memory RAG, and neural confidence guardrails
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Toggle 1: AI Auto-Assignment */}
        <div className="p-3.5 rounded-3 bg-body-tertiary border border-secondary-subtle d-flex align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="p-2 rounded-2 bg-primary-subtle text-primary border border-primary-subtle flex-shrink-0">
              <IconCpu size={18} />
            </div>
            <div>
              <div className="fw-bold text-body small">Autonomous Task Auto-Assignment</div>
              <div className="text-secondary small" style={{ fontSize: '0.75rem' }}>
                Allow Gemini 3.5 Flash to automatically assign incoming backlog tasks based on skill proficiencies and workload headroom.
              </div>
            </div>
          </div>
          <div className="form-check form-switch mb-0">
            <input
              type="checkbox"
              className="form-check-input cursor-pointer"
              style={{ width: '42px', height: '22px' }}
              {...register('aiAutoAssignEnabled')}
            />
          </div>
        </div>

        {/* Toggle 2: Capacity Heatmap Over-allocation Alerts */}
        <div className="p-3.5 rounded-3 bg-body-tertiary border border-secondary-subtle d-flex align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="p-2 rounded-2 bg-warning-subtle text-warning border border-warning-subtle flex-shrink-0">
              <IconFlame size={18} />
            </div>
            <div>
              <div className="fw-bold text-body small">Capacity Predictive Heatmap Engine</div>
              <div className="text-secondary small" style={{ fontSize: '0.75rem' }}>
                Continuously compute 14-day rolling capacity simulations to prevent burnout before deadlines.
              </div>
            </div>
          </div>
          <div className="form-check form-switch mb-0">
            <input
              type="checkbox"
              className="form-check-input cursor-pointer"
              defaultChecked
              style={{ width: '42px', height: '22px' }}
            />
          </div>
        </div>

        {/* Approval Mode */}
        <div className="mb-3">
          <label className="form-label small fw-bold text-secondary">
            AI Decision Governance Mode
          </label>
          <select className="form-select" {...register('aiApprovalMode')}>
            <option value={AiApprovalMode.RequireApproval}>
              Require Human Approval (All actions recorded in Neural Decision Ledger)
            </option>
            <option value={AiApprovalMode.AutoApply}>
              Auto-Apply High Confidence (Execute immediately if above threshold)
            </option>
          </select>
          <div className="text-muted small mt-1" style={{ fontSize: '0.72rem' }}>
            When set to Auto-Apply, tasks are reassigned instantly while maintaining a cryptographic audit trail.
          </div>
        </div>

        {/* Confidence Threshold Slider */}
        <div className="p-3.5 rounded-3 bg-body-tertiary border border-secondary-subtle">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <label className="form-label small fw-bold text-secondary mb-0">
              Minimum AI Confidence Threshold
            </label>
            <span className="badge bg-purple-subtle text-purple border border-purple-subtle px-2.5 py-1 rounded-pill small fw-bold">
              {thresholdPercent}% Certainty
            </span>
          </div>

          <input
            type="range"
            min="0.50"
            max="0.99"
            step="0.01"
            className="form-range"
            {...register('aiConfidenceThreshold')}
          />

          <div className="d-flex justify-content-between text-muted small mt-1" style={{ fontSize: '0.7rem' }}>
            <span>50% (Permissive)</span>
            <span>85% (Balanced Recommended)</span>
            <span>99% (Strict)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
