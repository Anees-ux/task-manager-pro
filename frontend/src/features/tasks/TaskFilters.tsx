import { TaskItemStatus, Priority } from '../../types/task';
import { FunnelIcon } from '@heroicons/react/24/outline';

interface TaskFiltersProps {
  statusFilter: TaskItemStatus | '';
  priorityFilter: Priority | '';
  onStatusChange: (status: TaskItemStatus | '') => void;
  onPriorityChange: (priority: Priority | '') => void;
}

export default function TaskFilters({ statusFilter, priorityFilter, onStatusChange, onPriorityChange }: TaskFiltersProps) {
  return (
    <div className="flex items-center gap-4 flex-wrap">
      <div className="flex items-center gap-2 text-slate-400">
        <FunnelIcon className="h-4 w-4" />
        <span className="text-sm font-medium">Filters</span>
      </div>
      <select
        value={statusFilter}
        onChange={e => onStatusChange(e.target.value as TaskItemStatus | '')}
        id="status-filter"
        className="px-3 py-2 rounded-xl bg-slate-700/50 border border-slate-600 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
      >
        <option value="">All Status</option>
        <option value={TaskItemStatus.Todo}>Todo</option>
        <option value={TaskItemStatus.InProgress}>In Progress</option>
        <option value={TaskItemStatus.Done}>Done</option>
      </select>
      <select
        value={priorityFilter}
        onChange={e => onPriorityChange(e.target.value as Priority | '')}
        id="priority-filter"
        className="px-3 py-2 rounded-xl bg-slate-700/50 border border-slate-600 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
      >
        <option value="">All Priority</option>
        <option value={Priority.High}>High</option>
        <option value={Priority.Medium}>Medium</option>
        <option value={Priority.Low}>Low</option>
      </select>
    </div>
  );
}
