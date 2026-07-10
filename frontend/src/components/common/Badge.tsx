import { useMemo } from 'react';
import { Priority, TaskItemStatus } from '../../types/task';

interface BadgeProps {
  type: 'priority' | 'status';
  value: Priority | TaskItemStatus;
}

export default function Badge({ type, value }: BadgeProps) {
  const { label, className } = useMemo(() => {
    if (type === 'priority') {
      switch (value) {
        case Priority.High:
          return { label: 'High', className: 'bg-red-500/15 text-red-400 border-red-500/30' };
        case Priority.Medium:
          return { label: 'Medium', className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
        case Priority.Low:
          return { label: 'Low', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
        default:
          return { label: String(value), className: 'bg-slate-500/15 text-slate-400 border-slate-500/30' };
      }
    } else {
      switch (value) {
        case TaskItemStatus.Todo:
          return { label: 'Todo', className: 'bg-slate-500/15 text-slate-400 border-slate-500/30' };
        case TaskItemStatus.InProgress:
          return { label: 'In Progress', className: 'bg-blue-500/15 text-blue-400 border-blue-500/30' };
        case TaskItemStatus.Done:
          return { label: 'Done', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
        default:
          return { label: String(value), className: 'bg-slate-500/15 text-slate-400 border-slate-500/30' };
      }
    }
  }, [type, value]);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${className}`}>
      {label}
    </span>
  );
}
