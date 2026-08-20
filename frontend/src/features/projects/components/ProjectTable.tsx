import React from 'react';
import type { Project } from '../types/project.types';
import { ProjectStatus } from '@shared/types/enums';
import { formatDate } from '@shared/lib/dateUtils';
import {
  IconFolder,
  IconClock,
  IconCheck,
  IconAlertCircle,
  IconArrowRight,
  IconListCheck,
} from '@tabler/icons-react';
import { Link } from 'react-router-dom';

interface ProjectTableProps {
  projects: Project[];
}

export function ProjectTable({ projects }: ProjectTableProps) {
  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.Active:
        return (
          <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1 rounded-pill small d-inline-flex align-items-center gap-1.5 fw-medium">
            <span className="p-1 rounded-circle bg-success d-inline-block shadow-sm" style={{ width: '6px', height: '6px' }} />
            Active
          </span>
        );
      case ProjectStatus.Completed:
        return (
          <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2.5 py-1 rounded-pill small d-inline-flex align-items-center gap-1.5 fw-medium">
            <IconCheck size={13} />
            Completed
          </span>
        );
      case ProjectStatus.OnHold:
        return (
          <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-2.5 py-1 rounded-pill small d-inline-flex align-items-center gap-1.5 fw-medium">
            <IconClock size={13} />
            On Hold
          </span>
        );
      default:
        return (
          <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2.5 py-1 rounded-pill small d-inline-flex align-items-center gap-1.5 fw-medium">
            <IconAlertCircle size={13} />
            Planning
          </span>
        );
    }
  };

  return (
    <div className="card glass-surface p-0 overflow-hidden shadow-sm">
      <div className="table-responsive">
        <table className="table table-vcenter table-hover card-table m-0 text-nowrap">
          <thead>
            <tr className="bg-body-tertiary border-bottom border-secondary-subtle">
              <th className="text-secondary small fw-bold text-uppercase py-3 ps-4" style={{ fontSize: '0.675rem', letterSpacing: '0.06em' }}>
                Project & Code
              </th>
              <th className="text-secondary small fw-bold text-uppercase py-3" style={{ fontSize: '0.675rem', letterSpacing: '0.06em' }}>
                Status
              </th>
              <th className="text-secondary small fw-bold text-uppercase py-3" style={{ fontSize: '0.675rem', letterSpacing: '0.06em' }}>
                Budget Utilization
              </th>
              <th className="text-secondary small fw-bold text-uppercase py-3 text-center" style={{ fontSize: '0.675rem', letterSpacing: '0.06em' }}>
                Tasks
              </th>
              <th className="text-secondary small fw-bold text-uppercase py-3" style={{ fontSize: '0.675rem', letterSpacing: '0.06em' }}>
                Target Deadline
              </th>
              <th className="text-secondary small fw-bold text-uppercase py-3 pe-4 text-end" style={{ fontSize: '0.675rem', letterSpacing: '0.06em' }}>
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => {
              const budgetPercent = Math.min(
                100,
                project.budgetAllocated > 0
                  ? Math.round((project.budgetConsumed / project.budgetAllocated) * 100)
                  : 0
              );

              return (
                <tr key={project.id} className="transition-fast border-bottom border-secondary-subtle">
                  {/* Project Info */}
                  <td className="py-3.5 ps-4">
                    <div className="d-flex align-items-center gap-3">
                      <div className="d-flex align-items-center justify-content-center p-2 rounded-3 bg-primary-subtle text-primary border border-primary-subtle flex-shrink-0">
                        <IconFolder size={18} />
                      </div>
                      <div className="overflow-hidden">
                        <div className="fw-semibold text-body text-truncate" style={{ maxWidth: '280px' }}>
                          {project.name}
                        </div>
                        <div className="d-flex align-items-center gap-2 small text-secondary">
                          <span className="font-monospace fw-semibold text-primary" style={{ fontSize: '0.72rem' }}>
                            {project.projectCode}
                          </span>
                          {project.description && (
                            <span className="text-truncate text-muted" style={{ maxWidth: '200px', fontSize: '0.75rem' }}>
                              &bull; {project.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5">{getStatusBadge(project.status)}</td>

                  {/* Budget Progress Bar */}
                  <td className="py-3.5" style={{ minWidth: '180px' }}>
                    <div className="d-flex justify-content-between small text-secondary mb-1">
                      <span style={{ fontSize: '0.75rem' }}>${project.budgetConsumed.toLocaleString()} spent</span>
                      <span className="text-body fw-bold" style={{ fontSize: '0.75rem' }}>
                        ${project.budgetAllocated.toLocaleString()}
                      </span>
                    </div>
                    <div
                      className="progress progress-xs bg-body-secondary border border-secondary-subtle"
                      style={{
                        borderRadius: '9999px',
                        height: '6px',
                      }}
                    >
                      <div
                        className={`progress-bar ${
                          budgetPercent > 90 ? 'bg-danger' : budgetPercent > 75 ? 'bg-warning' : 'bg-primary'
                        }`}
                        style={{ width: `${budgetPercent}%`, borderRadius: '9999px' }}
                      />
                    </div>
                  </td>

                  {/* Tasks Count */}
                  <td className="py-3.5 text-center">
                    <span className="badge bg-body-tertiary text-body border border-secondary-subtle px-2.5 py-1 rounded-pill small fw-medium">
                      <IconListCheck size={13} className="me-1 text-primary" />
                      {project.taskCount ?? 0}
                    </span>
                  </td>

                  {/* Target Deadline */}
                  <td className="py-3.5 text-secondary small fw-medium">
                    {formatDate(project.deadlineUtc, 'MMM dd, yyyy')}
                  </td>

                  {/* Action Link */}
                  <td className="py-3.5 pe-4 text-end">
                    <Link
                      to={`/projects/${project.id}`}
                      className="btn btn-sm btn-ghost-primary d-inline-flex align-items-center gap-1 px-2.5 py-1 rounded-2"
                      style={{ fontSize: '0.8rem' }}
                    >
                      <span>Details</span>
                      <IconArrowRight size={14} />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
