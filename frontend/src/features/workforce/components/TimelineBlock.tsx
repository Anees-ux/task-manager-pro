import React from 'react';
import type { Allocation } from '../types/workforce.types';
import { Priority } from '@shared/types/enums';
import { Link } from 'react-router-dom';

interface TimelineBlockProps {
  allocation: Allocation;
  gridStartCol: number;
  gridColSpan: number;
}

export function TimelineBlock({
  allocation,
  gridStartCol,
  gridColSpan,
}: TimelineBlockProps) {
  const isHeavyAllocation = allocation.allocationPercent >= 90;
  const isCritical = allocation.priority === Priority.Critical;

  // Determine adaptive styling theme based on workload and priority
  const getBlockStyle = () => {
    if (isCritical) {
      return {
        bg: 'bg-danger-subtle text-danger border-danger-subtle',
        badge: 'bg-danger text-white',
        dot: 'bg-danger',
      };
    }
    if (isHeavyAllocation) {
      return {
        bg: 'bg-warning-subtle text-warning border-warning-subtle',
        badge: 'bg-warning text-dark',
        dot: 'bg-warning',
      };
    }
    return {
      bg: 'bg-primary-subtle text-primary border-primary-subtle',
      badge: 'bg-primary text-white',
      dot: 'bg-primary',
    };
  };

  const style = getBlockStyle();

  return (
    <Link
      to={`/tasks?projectId=${allocation.taskId}`}
      className={`position-absolute rounded-2 px-2.5 py-1.5 border shadow-sm text-decoration-none d-flex flex-column justify-content-between transition-fast ${style.bg}`}
      style={{
        left: `calc(${gridStartCol - 1} * (100% / var(--timeline-cols)) + 4px)`,
        width: `calc(${gridColSpan} * (100% / var(--timeline-cols)) - 8px)`,
        top: '6px',
        bottom: '6px',
        zIndex: 2,
        overflow: 'hidden',
        minWidth: '90px',
      }}
      title={`${allocation.taskCode}: ${allocation.taskName} (${allocation.allocationPercent}% load)`}
    >
      {/* Top Header: Code & Load Pill */}
      <div className="d-flex align-items-center justify-content-between gap-1 mb-0.5">
        <span className="font-monospace fw-bold small text-truncate" style={{ fontSize: '0.68rem' }}>
          {allocation.taskCode}
        </span>
        <span
          className={`badge rounded-pill px-1.5 py-0.5 fw-bold ${style.badge}`}
          style={{ fontSize: '0.6rem' }}
        >
          {allocation.allocationPercent}%
        </span>
      </div>

      {/* Task Name */}
      <div
        className="fw-semibold text-truncate small lh-1"
        style={{ fontSize: '0.75rem', color: 'inherit' }}
      >
        {allocation.taskName}
      </div>

      {/* Optional Project Subtext */}
      {allocation.projectName && (
        <div
          className="text-truncate opacity-75"
          style={{ fontSize: '0.65rem' }}
        >
          {allocation.projectName}
        </div>
      )}
    </Link>
  );
}
