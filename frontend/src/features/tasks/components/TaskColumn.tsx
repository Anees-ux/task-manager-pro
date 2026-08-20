import React, { useState } from 'react';
import type { TaskItem } from '../types/task.types';
import { TaskItemStatus } from '@shared/types/enums';
import { TaskCard } from './TaskCard';
import { IconPlus } from '@tabler/icons-react';

interface TaskColumnProps {
  status: TaskItemStatus;
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  tasks: TaskItem[];
  colorVariant?: 'primary' | 'warning' | 'purple' | 'success' | 'secondary';
  onDropTask: (taskId: string, newStatus: TaskItemStatus) => void;
  onNewTaskClick?: (status: TaskItemStatus) => void;
  onCardClick?: (task: TaskItem) => void;
}

export function TaskColumn({
  status,
  title,
  icon: Icon,
  tasks,
  colorVariant = 'primary',
  onDropTask,
  onNewTaskClick,
  onCardClick,
}: TaskColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onDropTask(taskId, status);
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  return (
    <div
      className="col-12 col-md-6 col-xl-3 d-flex flex-column h-100"
      style={{ minWidth: '280px' }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Column Header */}
      <div className="card glass-surface p-3 mb-3 shadow-sm border-0">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <div
              className={`p-1.5 rounded-2 bg-${colorVariant}-subtle text-${colorVariant} border border-${colorVariant}-subtle d-flex align-items-center justify-content-center`}
            >
              <Icon size={16} />
            </div>
            <h3 className="h5 fw-bold text-body mb-0" style={{ fontSize: '0.875rem' }}>
              {title}
            </h3>
          </div>

          <div className="d-flex align-items-center gap-1.5">
            <span className="badge bg-body-tertiary text-body border border-secondary-subtle px-2 py-0.5 rounded-pill small fw-bold">
              {tasks.length}
            </span>
            {onNewTaskClick && (
              <button
                type="button"
                onClick={() => onNewTaskClick(status)}
                className="btn btn-sm btn-icon btn-ghost-secondary rounded-circle"
                title={`Add task to ${title}`}
                style={{ width: '24px', height: '24px' }}
              >
                <IconPlus size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Drop Zone & Card Stream */}
      <div
        className={`flex-fill p-2 rounded-3 transition-fast overflow-y-auto ${
          isDragOver ? 'bg-primary-subtle border border-dashed border-primary shadow-sm' : ''
        }`}
        style={{
          minHeight: '480px',
          maxHeight: 'calc(100vh - 270px)',
          background: isDragOver ? 'rgba(var(--tblr-primary-rgb), 0.08)' : 'transparent',
          transition: 'background-color 200ms ease, border 200ms ease',
        }}
      >
        {tasks.length === 0 ? (
          <div className="h-100 d-flex flex-column align-items-center justify-content-center text-center p-4 border border-dashed border-secondary-subtle rounded-3 text-secondary">
            <span className="small text-muted mb-2">No tasks in {title}</span>
            {onNewTaskClick && (
              <button
                type="button"
                onClick={() => onNewTaskClick(status)}
                className="btn btn-sm btn-ghost-primary d-inline-flex align-items-center gap-1"
                style={{ fontSize: '0.78rem' }}
              >
                <IconPlus size={14} />
                <span>Add Task</span>
              </button>
            )}
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDragStart={handleDragStart}
              onClick={() => onCardClick && onCardClick(task)}
            />
          ))
        )}
      </div>
    </div>
  );
}
