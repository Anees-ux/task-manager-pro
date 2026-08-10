import { useMemo } from 'react';
import type { TaskItem } from '../../types/task';
import Badge from '../../components/common/Badge';
import { PencilSquareIcon, TrashIcon, ClockIcon } from '@heroicons/react/24/outline';
import './TaskCard.scss';

interface TaskCardProps {
  task: TaskItem;
  onEdit: (task: TaskItem) => void;
  onDelete: (task: TaskItem) => void;
}

export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const formattedDueDate = useMemo(() => {
    if (!task.dueDate) return null;
    return new Date(task.dueDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, [task.dueDate]);

  return (
    <div
      className={`task-card group relative bg-slate-800/50 border rounded-2xl p-5 hover:bg-slate-800/80 transition-all duration-200 hover:shadow-lg hover:shadow-black/20 ${
        task.isOverdue ? 'task-card--overdue' : 'border-slate-700/50'
      }`}
    >
      {task.isOverdue && (
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/15 text-red-400 border border-red-500/30 animate-pulse">
            ⚠️ Overdue
          </span>
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-white mb-1 truncate">{task.title}</h3>
          {task.description && (
            <p className="text-sm text-slate-400 line-clamp-2 mb-3">{task.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <Badge type="status" value={task.status} />
            <Badge type="priority" value={task.priority} />
            {task.projectName && (
              <span className="text-xs text-slate-500 bg-slate-700/40 px-2 py-0.5 rounded-full">
                {task.projectName}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-700/30">
        <div className="flex items-center gap-4 text-xs text-slate-500">
          {formattedDueDate && (
            <span className={`flex items-center gap-1 ${task.isOverdue ? 'text-red-400' : ''}`}>
              <ClockIcon className="h-3.5 w-3.5" />
              Due: {formattedDueDate}
            </span>
          )}
          <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(task)}
            id={`edit-task-${task.id}`}
            className="p-2 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
            title="Edit task"
          >
            <PencilSquareIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(task)}
            id={`delete-task-${task.id}`}
            className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
            title="Delete task"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
