import React from 'react';
import type { TaskItem } from '../types/task.types';
import { Priority } from '@shared/types/enums';
import { formatDate } from '@shared/lib/dateUtils';
import {
  IconClock,
  IconUser,
  IconAlertTriangle,
  IconCheck,
  IconHourglassEmpty,
  IconFlame,
} from '@tabler/icons-react';

interface TaskCardProps {
  task: TaskItem;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  onClick?: () => void;
}

export function TaskCard({ task, onDragStart, onClick }: TaskCardProps) {
  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case Priority.Critical:
        return (
          <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-0.5 rounded-pill small d-inline-flex align-items-center gap-1">
            <IconFlame size={12} />
            Critical
          </span>
        );
      case Priority.High:
        return (
          <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-2 py-0.5 rounded-pill small d-inline-flex align-items-center gap-1">
            <IconAlertTriangle size={12} />
            High
          </span>
        );
      case Priority.Medium:
        return (
          <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-0.5 rounded-pill small d-inline-flex align-items-center gap-1">
            Medium
          </span>
        );
      case Priority.Low:
      default:
        return (
          <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2 py-0.5 rounded-pill small d-inline-flex align-items-center gap-1">
            Low
          </span>
        );
    }
  };

  const isOverdue = task.isOverdue || (task.dueDateUtc && new Date(task.dueDateUtc) < new Date() && task.status !== 'Done');

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart && onDragStart(e, task.id)}
      onClick={onClick}
      className="card p-3 mb-2.5 shadow-sm transition-fast cursor-grab user-select-none"
      style={{
        cursor: 'grab',
      }}
    >
      {/* Top Header: Code & Priority Badge */}
      <div className="d-flex align-items-center justify-content-between mb-2">
        <span className="font-monospace fw-bold text-primary small" style={{ fontSize: '0.72rem' }}>
          {task.taskCode}
        </span>
        {getPriorityBadge(task.priority)}
      </div>

      {/* Title */}
      <h4 className="fw-semibold text-body mb-1.5 lh-sm" style={{ fontSize: '0.875rem' }}>
        {task.title}
      </h4>

      {/* Description Preview (if present) */}
      {task.description && (
        <p
          className="text-secondary small mb-2.5 text-truncate-2"
          style={{
            fontSize: '0.75rem',
            lineHeight: '1.4',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {task.description}
        </p>
      )}

      {/* Footer Info: Assignee & Timeline & Estimated Hours */}
      <div className="d-flex align-items-center justify-content-between pt-2 border-top border-secondary-subtle mt-1 text-secondary small">
        {/* Assignee Avatar / Name */}
        <div className="d-flex align-items-center gap-1.5 text-truncate" style={{ maxWidth: '130px' }}>
          <div
            className="avatar avatar-xs rounded-circle bg-primary-subtle text-primary border border-primary-subtle d-inline-flex align-items-center justify-content-center flex-shrink-0"
            style={{ width: '22px', height: '22px', fontSize: '0.65rem' }}
          >
            {task.assigneeName ? task.assigneeName.charAt(0).toUpperCase() : <IconUser size={12} />}
          </div>
          <span className="text-truncate text-muted" style={{ fontSize: '0.72rem' }}>
            {task.assigneeName || 'Unassigned'}
          </span>
        </div>

        {/* Due Date & Hours */}
        <div className="d-flex align-items-center gap-2 flex-shrink-0">
          {task.estimatedHours > 0 && (
            <span className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: '0.72rem' }} title="Estimated Hours">
              <IconHourglassEmpty size={12} />
              <span>{task.estimatedHours}h</span>
            </span>
          )}

          {task.dueDateUtc && (
            <span
              className={`d-flex align-items-center gap-1 fw-medium ${
                isOverdue ? 'text-danger' : 'text-secondary'
              }`}
              style={{ fontSize: '0.72rem' }}
              title={isOverdue ? 'Task Overdue' : 'Due Date'}
            >
              <IconClock size={12} />
              <span>{formatDate(task.dueDateUtc, 'MMM dd')}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
