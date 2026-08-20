import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  IconFolder,
  IconHash,
  IconCurrencyDollar,
  IconCalendar,
  IconFileText,
  IconX,
  IconPlus,
  IconAlertCircle,
} from '@tabler/icons-react';
import { useCreateProject } from '../hooks/useProjects';

const createProjectSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters').max(100),
  projectCode: z
    .string()
    .min(2, 'Project code is required (e.g. PRJ-01)')
    .max(20)
    .regex(/^[A-Z0-9_-]+$/i, 'Project code must be alphanumeric (e.g. PRJ-01)'),
  budgetAllocated: z.coerce.number().min(0, 'Budget cannot be negative'),
  startDate: z.string().optional(),
  deadlineUtc: z.string().optional(),
  description: z.string().max(500).optional(),
});

type CreateProjectFormData = z.infer<typeof createProjectSchema>;

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateProjectModal({ open, onClose }: CreateProjectModalProps) {
  const createMutation = useCreateProject();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      projectCode: '',
      budgetAllocated: 5000,
      startDate: new Date().toISOString().split('T')[0],
      deadlineUtc: '',
      description: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: '',
        projectCode: '',
        budgetAllocated: 5000,
        startDate: new Date().toISOString().split('T')[0],
        deadlineUtc: '',
        description: '',
      });
    }
  }, [open, reset]);

  if (!open) return null;

  const onSubmit = async (data: CreateProjectFormData) => {
    await createMutation.mutateAsync({
      name: data.name,
      projectCode: data.projectCode.toUpperCase(),
      budgetAllocated: data.budgetAllocated,
      startDate: data.startDate ? `${data.startDate}T00:00:00Z` : null,
      deadlineUtc: data.deadlineUtc ? `${data.deadlineUtc}T23:59:59Z` : null,
      description: data.description || null,
    });
    onClose();
  };

  return (
    <div
      className="modal modal-blur d-block show"
      tabIndex={-1}
      style={{
        backgroundColor: 'rgba(5, 8, 17, 0.75)',
        backdropFilter: 'blur(10px)',
        zIndex: 1050,
      }}
    >
      <div className="modal-dialog modal-dialog-centered modal-md">
        <div className="modal-content glass-surface p-2 shadow-lg border-0">
          {/* Modal Header */}
          <div className="modal-header border-bottom border-secondary-subtle px-4 py-3">
            <div className="d-flex align-items-center gap-2.5">
              <div
                className="d-flex align-items-center justify-content-center p-2 rounded-3 text-primary"
                style={{
                  background: 'rgba(var(--tblr-primary-rgb), 0.12)',
                  boxShadow: 'inset 0 0 0 1px rgba(var(--tblr-primary-rgb), 0.25)',
                }}
              >
                <IconFolder size={20} />
              </div>
              <div>
                <h5 className="modal-title fw-bold text-white mb-0">Create Strategic Project</h5>
                <div className="text-secondary small" style={{ fontSize: '0.75rem' }}>
                  Initialize milestone telemetry and budget limits
                </div>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              disabled={isSubmitting}
            />
          </div>

          {/* Modal Form Body */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="modal-body px-4 py-3 space-y-3">
              {/* Project Name */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Project Name *</label>
                <div className="input-icon">
                  <span className="input-icon-addon">
                    <IconFolder size={17} />
                  </span>
                  <input
                    type="text"
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    placeholder="e.g. Mobile App Redesign"
                    autoFocus
                    disabled={isSubmitting}
                    {...register('name')}
                  />
                </div>
                {errors.name && (
                  <div className="d-flex align-items-center gap-1 text-danger small mt-1">
                    <IconAlertCircle size={13} />
                    <span>{errors.name.message}</span>
                  </div>
                )}
              </div>

              {/* Grid: Code & Budget */}
              <div className="row g-3 mb-3">
                <div className="col-sm-6">
                  <label className="form-label small fw-semibold text-secondary">Project Code *</label>
                  <div className="input-icon">
                    <span className="input-icon-addon">
                      <IconHash size={17} />
                    </span>
                    <input
                      type="text"
                      className={`form-control font-monospace ${errors.projectCode ? 'is-invalid' : ''}`}
                      placeholder="e.g. MOB-01"
                      disabled={isSubmitting}
                      {...register('projectCode')}
                    />
                  </div>
                  {errors.projectCode && (
                    <div className="d-flex align-items-center gap-1 text-danger small mt-1">
                      <IconAlertCircle size={13} />
                      <span>{errors.projectCode.message}</span>
                    </div>
                  )}
                </div>

                <div className="col-sm-6">
                  <label className="form-label small fw-semibold text-secondary">Allocated Budget ($)</label>
                  <div className="input-icon">
                    <span className="input-icon-addon">
                      <IconCurrencyDollar size={17} />
                    </span>
                    <input
                      type="number"
                      step="100"
                      className={`form-control ${errors.budgetAllocated ? 'is-invalid' : ''}`}
                      placeholder="5000"
                      disabled={isSubmitting}
                      {...register('budgetAllocated')}
                    />
                  </div>
                  {errors.budgetAllocated && (
                    <div className="d-flex align-items-center gap-1 text-danger small mt-1">
                      <IconAlertCircle size={13} />
                      <span>{errors.budgetAllocated.message}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Grid: Start Date & Deadline */}
              <div className="row g-3 mb-3">
                <div className="col-sm-6">
                  <label className="form-label small fw-semibold text-secondary">Start Date</label>
                  <div className="input-icon">
                    <span className="input-icon-addon">
                      <IconCalendar size={17} />
                    </span>
                    <input
                      type="date"
                      className="form-control"
                      disabled={isSubmitting}
                      {...register('startDate')}
                    />
                  </div>
                </div>

                <div className="col-sm-6">
                  <label className="form-label small fw-semibold text-secondary">Target Deadline</label>
                  <div className="input-icon">
                    <span className="input-icon-addon">
                      <IconCalendar size={17} />
                    </span>
                    <input
                      type="date"
                      className="form-control"
                      disabled={isSubmitting}
                      {...register('deadlineUtc')}
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-2">
                <label className="form-label small fw-semibold text-secondary">Description / Objectives</label>
                <div className="input-icon">
                  <span className="input-icon-addon" style={{ top: '14px' }}>
                    <IconFileText size={17} />
                  </span>
                  <textarea
                    rows={3}
                    className="form-control"
                    placeholder="Provide context and key strategic goals for this project..."
                    disabled={isSubmitting}
                    {...register('description')}
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer border-top border-secondary-subtle px-4 py-3 d-flex justify-content-between">
              <button
                type="button"
                className="btn btn-ghost-secondary px-3"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary d-flex align-items-center gap-2 px-4 shadow-sm"
                disabled={isSubmitting || createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                    <span>Provisioning...</span>
                  </>
                ) : (
                  <>
                    <IconPlus size={16} />
                    <span>Create Project</span>
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
