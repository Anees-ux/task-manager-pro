import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { useInviteUser } from '../hooks/useWorkforce';
import { UserRole } from '@shared/types/enums';
import {
  IconUserPlus,
  IconMail,
  IconUser,
  IconShield,
  IconBriefcase,
  IconCurrencyDollar,
  IconPlus,
  IconAlertCircle,
  IconCode,
} from '@tabler/icons-react';

const addTeamMemberSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid work email address'),
  role: z.nativeEnum(UserRole),
  department: z.string().min(1, 'Please select a department/team'),
  hourlyRate: z.coerce.number().min(0, 'Hourly rate cannot be negative'),
  skills: z.string().optional(),
});

type AddTeamMemberFormData = z.infer<typeof addTeamMemberSchema>;

interface AddTeamMemberModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddTeamMemberModal({ open, onClose }: AddTeamMemberModalProps) {
  const inviteMutation = useInviteUser();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddTeamMemberFormData>({
    resolver: zodResolver(addTeamMemberSchema),
    defaultValues: {
      fullName: '',
      email: '',
      role: UserRole.Developer,
      department: 'Engineering',
      hourlyRate: 65,
      skills: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        fullName: '',
        email: '',
        role: UserRole.Developer,
        department: 'Engineering',
        hourlyRate: 65,
        skills: '',
      });
    }
  }, [open, reset]);

  if (!open) return null;

  const isSubmitting = inviteMutation.isPending;

  const onSubmit = async (data: AddTeamMemberFormData) => {
    try {
      await inviteMutation.mutateAsync(data);
      onClose();
    } catch {
      // Handled in onError callback of useInviteUser
    }
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
                className="d-flex align-items-center justify-content-center p-2 rounded-3 text-primary bg-primary-subtle border border-primary-subtle"
              >
                <IconUserPlus size={20} />
              </div>
              <div>
                <h5 className="modal-title fw-bold text-body mb-0">Invite Team Member</h5>
                <div className="text-secondary small" style={{ fontSize: '0.75rem' }}>
                  Provision workspace access and allocate capacity
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
              {/* Full Name */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Full Name *</label>
                <div className="input-icon">
                  <span className="input-icon-addon">
                    <IconUser size={17} />
                  </span>
                  <input
                    type="text"
                    className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                    placeholder="e.g. Sarah Connor"
                    autoFocus
                    disabled={isSubmitting}
                    {...register('fullName')}
                  />
                </div>
                {errors.fullName && (
                  <div className="d-flex align-items-center gap-1 text-danger small mt-1">
                    <IconAlertCircle size={13} />
                    <span>{errors.fullName.message}</span>
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Work Email Address *</label>
                <div className="input-icon">
                  <span className="input-icon-addon">
                    <IconMail size={17} />
                  </span>
                  <input
                    type="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    placeholder="sarah.connor@acme.com"
                    disabled={isSubmitting}
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <div className="d-flex align-items-center gap-1 text-danger small mt-1">
                    <IconAlertCircle size={13} />
                    <span>{errors.email.message}</span>
                  </div>
                )}
              </div>

              {/* Grid: Role & Department */}
              <div className="row g-3 mb-3">
                <div className="col-sm-6">
                  <label className="form-label small fw-semibold text-secondary">Workspace Role *</label>
                  <div className="input-icon">
                    <span className="input-icon-addon">
                      <IconShield size={17} />
                    </span>
                    <select
                      className={`form-select ${errors.role ? 'is-invalid' : ''}`}
                      disabled={isSubmitting}
                      {...register('role')}
                    >
                      <option value={UserRole.Developer}>Developer / Engineer</option>
                      <option value={UserRole.Manager}>Engineering Manager</option>
                      <option value={UserRole.Admin}>Workspace Admin</option>
                      <option value={UserRole.Viewer}>Read-Only Viewer</option>
                    </select>
                  </div>
                </div>

                <div className="col-sm-6">
                  <label className="form-label small fw-semibold text-secondary">Department / Team *</label>
                  <div className="input-icon">
                    <span className="input-icon-addon">
                      <IconBriefcase size={17} />
                    </span>
                    <select
                      className={`form-select ${errors.department ? 'is-invalid' : ''}`}
                      disabled={isSubmitting}
                      {...register('department')}
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Product">Product & Design</option>
                      <option value="DevOps">Cloud / DevOps</option>
                      <option value="QA">Quality Assurance</option>
                      <option value="Operations">Operations</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Technical Skills (Comma separated) for AI Task Router */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">
                  Technical Skills (Comma separated)
                </label>
                <div className="input-icon">
                  <span className="input-icon-addon">
                    <IconCode size={17} />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. React.js, ASP.NET Core, SQL Server, TypeScript"
                    disabled={isSubmitting}
                    {...register('skills')}
                  />
                </div>
                <div className="text-secondary small mt-1" style={{ fontSize: '0.72rem' }}>
                  Used by Gemini AI Task Router for autonomous skill matching and task routing.
                </div>
              </div>

              {/* Hourly Billing Rate */}
              <div className="mb-2">
                <label className="form-label small fw-semibold text-secondary">Standard Hourly Rate ($/hr)</label>
                <div className="input-icon">
                  <span className="input-icon-addon">
                    <IconCurrencyDollar size={17} />
                  </span>
                  <input
                    type="number"
                    step="5"
                    className={`form-control ${errors.hourlyRate ? 'is-invalid' : ''}`}
                    placeholder="65"
                    disabled={isSubmitting}
                    {...register('hourlyRate')}
                  />
                </div>
                <div className="text-secondary small mt-1" style={{ fontSize: '0.72rem' }}>
                  Used by Project Command Center for automatic budget burn rate tracking.
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
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                    <span>Sending Invite...</span>
                  </>
                ) : (
                  <>
                    <IconPlus size={16} />
                    <span>Send Invitation</span>
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
