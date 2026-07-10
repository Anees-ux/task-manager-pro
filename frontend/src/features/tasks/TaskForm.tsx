import { useState, useEffect } from 'react';
import type { TaskItem, CreateTaskRequest, UpdateTaskRequest } from '../../types/task';
import { TaskItemStatus, Priority } from '../../types/task';
import type { Project } from '../../types/project';
import Modal from '../../components/common/Modal';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTaskRequest | UpdateTaskRequest) => Promise<void>;
  task: TaskItem | null;
  projects: Project[];
  defaultProjectId?: number | null;
}

export default function TaskForm({ isOpen, onClose, onSubmit, task, projects, defaultProjectId }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskItemStatus>(TaskItemStatus.Todo);
  const [priority, setPriority] = useState<Priority>(Priority.Medium);
  const [projectId, setProjectId] = useState<number>(0);
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!task;

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
      setPriority(task.priority);
      setProjectId(task.projectId);
      setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
    } else {
      setTitle('');
      setDescription('');
      setStatus(TaskItemStatus.Todo);
      setPriority(Priority.Medium);
      setProjectId(defaultProjectId || projects[0]?.id || 0);
      setDueDate('');
    }
    setErrors({});
  }, [task, isOpen, projects, defaultProjectId]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!projectId) newErrors.projectId = 'Please select a project';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const data = {
        title: title.trim(),
        description: description.trim() || null,
        status,
        priority,
        projectId,
        dueDate: dueDate || null,
      };
      await onSubmit(data);
      onClose();
    } catch {
      // Error handled by hook toast
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Task' : 'Create New Task'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Title *</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            id="task-title-input"
            placeholder="Enter task title"
            className={`w-full px-4 py-2.5 rounded-xl bg-slate-700/50 border text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
              errors.title ? 'border-red-500' : 'border-slate-600'
            }`}
          />
          {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            id="task-desc-input"
            placeholder="Optional description"
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Project *</label>
            <select
              value={projectId}
              onChange={e => setProjectId(Number(e.target.value))}
              id="task-project-select"
              className={`w-full px-4 py-2.5 rounded-xl bg-slate-700/50 border text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer ${
                errors.projectId ? 'border-red-500' : 'border-slate-600'
              }`}
            >
              <option value={0}>Select project</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {errors.projectId && <p className="text-red-400 text-xs mt-1">{errors.projectId}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as TaskItemStatus)}
              id="task-status-select"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-700/50 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
            >
              <option value={TaskItemStatus.Todo}>Todo</option>
              <option value={TaskItemStatus.InProgress}>In Progress</option>
              <option value={TaskItemStatus.Done}>Done</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Priority</label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value as Priority)}
              id="task-priority-select"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-700/50 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
            >
              <option value={Priority.Low}>Low</option>
              <option value={Priority.Medium}>Medium</option>
              <option value={Priority.High}>High</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              id="task-duedate-input"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-700/50 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            id="save-task-btn"
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Saving...' : isEditing ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
