import React, { useState, useEffect } from 'react';
import type { AiDecision } from '../types/intelligence.types';
import { useManualAssignDecision } from '../hooks/useIntelligence';
import { useTeamRoster } from '@features/workforce/hooks/useWorkforce';
import {
  IconUserCheck,
  IconAlertTriangle,
  IconUser,
  IconNote,
  IconX,
  IconLoader2,
} from '@tabler/icons-react';

interface ManualAssignModalProps {
  open: boolean;
  onClose: () => void;
  decision: AiDecision | null;
}

export function ManualAssignModal({ open, onClose, decision }: ManualAssignModalProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');

  const { data: teamMembers = [], isLoading: isLoadingTeam } = useTeamRoster();
  const manualAssignMutation = useManualAssignDecision();

  useEffect(() => {
    if (open) {
      setSelectedUserId('');
      setNotes('');
      setValidationError('');
    }
  }, [open]);

  if (!open || !decision) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      setValidationError('Please select a team member to assign the task.');
      return;
    }

    manualAssignMutation.mutate(
      {
        id: decision.id,
        data: {
          assigneeId: selectedUserId,
          notes: notes.trim() ? notes : 'Human administrator manual override after AI escalation.',
        },
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      role="dialog"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', zIndex: 1060 }}
    >
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '520px' }}>
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden bg-body">
          {/* Header */}
          <div className="modal-header px-4 py-3.5 bg-body-tertiary border-bottom border-secondary-subtle">
            <div className="d-flex align-items-center gap-2.5">
              <div className="p-2 rounded-3 bg-warning-subtle text-warning border border-warning-subtle">
                <IconUserCheck size={20} />
              </div>
              <div>
                <h5 className="modal-title fs-6 fw-bold mb-0">Manual Assignment Override</h5>
                <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                  Decision ID: {decision.id.substring(0, 8)}... | Escalated after {decision.rejectionCount || 3} rejections
                </span>
              </div>
            </div>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
              disabled={manualAssignMutation.isPending}
            />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              {/* Alert Callout */}
              <div className="p-3 rounded-3 bg-warning-subtle text-warning-emphasis border border-warning-subtle mb-3.5">
                <div className="d-flex align-items-start gap-2">
                  <IconAlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
                  <div className="small">
                    <strong>Guardrail Triggered:</strong> Autonomous AI routing has been rejected multiple times for this task. Select a team member manually to override and resolve this escalation.
                  </div>
                </div>
              </div>

              {/* Task Target Info */}
              <div className="mb-3 p-2.5 rounded-3 bg-body-tertiary border border-secondary-subtle small">
                <div className="text-muted mb-1" style={{ fontSize: '0.72rem' }}>
                  Target Entity: <span className="fw-semibold text-body">{decision.targetEntityType}</span> ({decision.targetEntityId.substring(0, 8)}...)
                </div>
                {decision.reviewNotes && (
                  <div className="text-secondary" style={{ fontSize: '0.75rem' }}>
                    <span className="fw-medium">Last Rejection Reason:</span> {decision.reviewNotes}
                  </div>
                )}
              </div>

              {/* Select Developer Dropdown */}
              <div className="mb-3.5">
                <label className="form-label small fw-semibold d-flex align-items-center gap-1.5 mb-1.5">
                  <IconUser size={15} className="text-primary" />
                  Select Assignee <span className="text-danger">*</span>
                </label>

                {isLoadingTeam ? (
                  <div className="d-flex align-items-center gap-2 p-2.5 rounded-3 border bg-body-tertiary text-muted small">
                    <IconLoader2 size={16} className="animate-spin" />
                    <span>Loading workforce members...</span>
                  </div>
                ) : (
                  <select
                    className={`form-select form-select-sm py-2 rounded-3 ${
                      validationError ? 'is-invalid' : ''
                    }`}
                    value={selectedUserId}
                    onChange={(e) => {
                      setSelectedUserId(e.target.value);
                      setValidationError('');
                    }}
                  >
                    <option value="">-- Choose Team Member --</option>
                    {teamMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.fullName} ({member.role}) — ${member.hourlyRate}/hr
                      </option>
                    ))}
                  </select>
                )}

                {validationError && (
                  <div className="text-danger small mt-1" style={{ fontSize: '0.75rem' }}>
                    {validationError}
                  </div>
                )}
              </div>

              {/* Admin Override Notes */}
              <div className="mb-2">
                <label className="form-label small fw-semibold d-flex align-items-center gap-1.5 mb-1.5">
                  <IconNote size={15} className="text-secondary" />
                  Override Notes (Optional)
                </label>
                <textarea
                  className="form-control form-control-sm rounded-3"
                  rows={3}
                  placeholder="Provide context on why this team member was manually assigned..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer px-4 py-3 bg-body-tertiary border-top border-secondary-subtle d-flex justify-content-between">
              <button
                type="button"
                className="btn btn-sm btn-ghost-secondary px-3 py-1.5 rounded-2"
                onClick={onClose}
                disabled={manualAssignMutation.isPending}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-sm btn-warning px-3.5 py-1.5 rounded-2 d-inline-flex align-items-center gap-1.5 fw-semibold shadow-sm"
                disabled={manualAssignMutation.isPending || !selectedUserId}
              >
                {manualAssignMutation.isPending ? (
                  <>
                    <IconLoader2 size={15} className="animate-spin" />
                    <span>Assigning Task...</span>
                  </>
                ) : (
                  <>
                    <IconUserCheck size={15} />
                    <span>Confirm Manual Assignment</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
