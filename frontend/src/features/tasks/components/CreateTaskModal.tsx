import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Priority, TaskItemStatus } from '@shared/types/enums';
import { useCreateTask } from '../hooks/useTasks';
import { useProjects } from '@features/projects/hooks/useProjects';
import {
  IconCheckbox,
  IconHash,
  IconFolder,
  IconClock,
  IconFlame,
  IconCalendar,
  IconFileText,
  IconCode,
  IconPlus,
  IconAlertCircle,
} from '@tabler/icons-react';

const createTaskSchema = z.object({
  title: z.string().min(2, 'Task title must be at least 2 characters').max(150),
  taskCode: z
    .string()
    .min(2, 'Task code is required (e.g. TSK-101)')
    .max(25)
    .regex(/^[A-Z0-9_-]+$/i, 'Code must be alphanumeric (e.g. TSK-101)'),
  projectId: z.string().min(1, 'Please select a project'),
  priority: z.nativeEnum(Priority),
  estimatedHours: z.coerce.number().min(0, 'Estimated hours cannot be negative'),
  dueDateUtc: z.string().optional(),
  requiredSkills: z.string().max(100).optional(),
  description: z.string().max(1000).optional(),
});

type CreateTaskFormData = z.infer<typeof createTaskSchema>;

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  defaultProjectId?: string;
  defaultStatus?: TaskItemStatus;
}

export function CreateTaskModal({
  open,
  onClose,
  defaultProjectId,
}: CreateTaskModalProps) {
  const createTaskMutation = useCreateTask();
  const { data: projects = [] } = useProjects();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      taskCode: '',
      projectId: defaultProjectId || (projects[0]?.id ?? ''),
      priority: Priority.Medium,
      estimatedHours: 4,
      dueDateUtc: '',
      requiredSkills: '',
      description: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        title: '',
        taskCode: `TSK-${Math.floor(100 + Math.random() * 900)}`,
        projectId: defaultProjectId || (projects[0]?.id ?? ''),
        priority: Priority.Medium,
        estimatedHours: 4,
        dueDateUtc: '',
        requiredSkills: '',
        description: '',
      });
    }
  }, [open, defaultProjectId, projects, reset]);

  if (!open) return null;

  const onSubmit = async (data: CreateTaskFormData) => {
    await createTaskMutation.mutateAsync({
      title: data.title,
      taskCode: data.taskCode.toUpperCase(),
      projectId: data.projectId,
      priority: data.priority,
      estimatedHours: data.estimatedHours,
      dueDateUtc: data.dueDateUtc ? `${data.dueDateUtc}T23:59:59Z` : null,
      requiredSkills: data.requiredSkills || null,
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
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content glass-surface p-2 shadow-lg border-0">
          {/* Modal Header */}
          <div className="modal-header border-bottom border-secondary-subtle px-4 py-3">
            <div className="d-flex align-items-center gap-2.5">
              <div
                className="d-flex align-items-center justify-content-center p-2 rounded-3 text-primary bg-primary-subtle border border-primary-subtle"
              >
                <IconCheckbox size={20} />
              </div>
              <div>
                <h5 className="modal-title fw-bold text-body mb-0">Create Execution Task</h5>
                <div className="text-secondary small" style={{ fontSize: '0.75rem' }}>
                  Assign to project milestone with capacity estimation
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

          {/* Form Body */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="modal-body px-4 py-3 space-y-3">
              {/* Task Title */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Task Title *</label>
                <div className="input-icon">
                  <span className="input-icon-addon">
                    <IconCheckbox size={17} />
                  </span>
                  <input
                    type="text"
                    className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                    placeholder="e.g. Implement Multi-Tenant JWT Interceptors"
                    autoFocus
                    disabled={isSubmitting}
                    {...register('title')}
                  />
                </div>
                {errors.title && (
                  <div className="d-flex align-items-center gap-1 text-danger small mt-1">
                    <IconAlertCircle size={13} />
                    <span>{errors.title.message}</span>
                  </div>
                )}
              </div>

              {/* Grid: Code & Project */}
              <div className="row g-3 mb-3">
                <div className="col-sm-4">
                  <label className="form-label small fw-semibold text-secondary">Task Code *</label>
                  <div className="input-icon">
                    <span className="input-icon-addon">
                      <IconHash size={17} />
                    </span>
                    <input
                      type="text"
                      className={`form-control font-monospace ${errors.taskCode ? 'is-invalid' : ''}`}
                      placeholder="TSK-101"
                      disabled={isSubmitting}
                      {...register('taskCode')}
                    />
                  </div>
                  {errors.taskCode && (
                    <div className="d-flex align-items-center gap-1 text-danger small mt-1">
                      <IconAlertCircle size={13} />
                      <span>{errors.taskCode.message}</span>
                    </div>
                  )}
                </div>

                <div className="col-sm-8">
                  <label className="form-label small fw-semibold text-secondary">Assigned Project *</label>
                  <div className="input-icon">
                    <span className="input-icon-addon">
                      <IconFolder size={17} />
                    </span>
                    <select
                      className={`form-select ${errors.projectId ? 'is-invalid' : ''}`}
                      disabled={isSubmitting}
                      {...register('projectId')}
                    >
                      {projects.length === 0 ? (
                        <option value="">No projects available (Create a project first)</option>
                      ) : (
                        projects.map((p) => (
                          <option key={p.id} value={p.id}>
                            [{p.projectCode}] {p.name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  {errors.projectId && (
                    <div className="d-flex align-items-center gap-1 text-danger small mt-1">
                      <IconAlertCircle size={13} />
                      <span>{errors.projectId.message}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Grid: Priority, Estimated Hours, Due Date */}
              <div className="row g-3 mb-3">
                <div className="col-sm-4">
                  <label className="form-label small fw-semibold text-secondary">Priority</label>
                  <div className="input-icon">
                    <span className="input-icon-addon">
                      <IconFlame size={17} />
                    </span>
                    <select
                      className="form-select"
                      disabled={isSubmitting}
                      {...register('priority')}
                    >
                      <option value={Priority.Low}>Low</option>
                      <option value={Priority.Medium}>Medium</option>
                      <option value={Priority.High}>High</option>
                      <option value={Priority.Critical}>Critical</option>
                    </select>
                  </div>
                </div>

                <div className="col-sm-4">
                  <label className="form-label small fw-semibold text-secondary">Estimated Hours</label>
                  <div className="input-icon">
                    <span className="input-icon-addon">
                      <IconClock size={17} />
                    </span>
                    <input
                      type="number"
                      step="0.5"
                      className={`form-control ${errors.estimatedHours ? 'is-invalid' : ''}`}
                      placeholder="4"
                      disabled={isSubmitting}
                      {...register('estimatedHours')}
                    />
                  </div>
                </div>

                <div className="col-sm-4">
                  <label className="form-label small fw-semibold text-secondary">Target Due Date</label>
                  <div className="input-icon">
                    <span className="input-icon-addon">
                      <IconCalendar size={17} />
                    </span>
                    <input
                      type="date"
                      className="form-control"
                      disabled={isSubmitting}
                      {...register('dueDateUtc')}
                    />
                  </div>
                </div>
              </div>

              {/* Required Skills & Tags */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Required Skills (Optional)</label>
                <div className="input-icon">
                  <span className="input-icon-addon">
                    <IconCode size={17} />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. React, TypeScript, C#, Docker (used by AI Auto-Router)"
                    disabled={isSubmitting}
                    {...register('requiredSkills')}
                  />
                </div>
                <div className="text-secondary small mt-1" style={{ fontSize: '0.72rem' }}>
                  AI Auto-Routing uses skill tags to match against team member capability matrices.
                </div>
              </div>

              {/* Description */}
              <div className="mb-2">
                <label className="form-label small fw-semibold text-secondary">Description / Acceptance Criteria</label>
                <div className="input-icon">
                  <span className="input-icon-addon" style={{ top: '14px' }}>
                    <IconFileText size={17} />
                  </span>
                  <textarea
                    rows={3}
                    className="form-control"
                    placeholder="Provide execution details and acceptance criteria..."
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
                disabled={isSubmitting || createTaskMutation.isPending || projects.length === 0}
              >
                {createTaskMutation.isPending ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                    <span>Creating Task...</span>
                  </>
                ) : (
                  <>
                    <IconPlus size={16} />
                    <span>Create Task</span>
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
