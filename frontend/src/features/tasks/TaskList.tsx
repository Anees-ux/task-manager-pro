import { useState, useEffect, useCallback, useMemo } from 'react';
import type { TaskItem, CreateTaskRequest, UpdateTaskRequest } from '../../types/task';
import { TaskItemStatus, Priority } from '../../types/task';
import type { Project } from '../../types/project';
import TaskCard from './TaskCard';
import TaskFilters from './TaskFilters';
import TaskForm from './TaskForm';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { PlusIcon } from '@heroicons/react/24/outline';

interface TaskListProps {
  tasks: TaskItem[];
  projects: Project[];
  loading: boolean;
  selectedProjectId: number | null;
  onFetchTasks: (filters?: { status?: TaskItemStatus; priority?: Priority; projectId?: number }) => Promise<void>;
  onCreateTask: (request: CreateTaskRequest) => Promise<void>;
  onUpdateTask: (id: number, request: UpdateTaskRequest) => Promise<void>;
  onDeleteTask: (id: number) => Promise<void>;
}

export default function TaskList({
  tasks, projects, loading, selectedProjectId,
  onFetchTasks, onCreateTask, onUpdateTask, onDeleteTask
}: TaskListProps) {
  const [statusFilter, setStatusFilter] = useState<TaskItemStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<Priority | ''>('');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TaskItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadTasks = useCallback(() => {
    const filters: { status?: TaskItemStatus; priority?: Priority; projectId?: number } = {};
    if (statusFilter) filters.status = statusFilter;
    if (priorityFilter) filters.priority = priorityFilter;
    if (selectedProjectId) filters.projectId = selectedProjectId;
    onFetchTasks(filters);
  }, [statusFilter, priorityFilter, selectedProjectId, onFetchTasks]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleFormSubmit = useCallback(async (data: CreateTaskRequest | UpdateTaskRequest) => {
    if (editingTask) {
      await onUpdateTask(editingTask.id, data as UpdateTaskRequest);
    } else {
      await onCreateTask(data as CreateTaskRequest);
    }
    loadTasks();
  }, [editingTask, onCreateTask, onUpdateTask, loadTasks]);

  const handleEdit = useCallback((task: TaskItem) => {
    setEditingTask(task);
    setShowForm(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await onDeleteTask(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, onDeleteTask]);

  const handleCreate = useCallback(() => {
    setEditingTask(null);
    setShowForm(true);
  }, []);

  const filteredTasks = useMemo(() => tasks, [tasks]);

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-6">
        <TaskFilters
          statusFilter={statusFilter}
          priorityFilter={priorityFilter}
          onStatusChange={setStatusFilter}
          onPriorityChange={setPriorityFilter}
        />
        <button
          onClick={handleCreate}
          id="add-task-btn"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
        >
          <PlusIcon className="h-4 w-4" />
          Add Task
        </button>
      </div>

      {/* Task Grid */}
      {loading ? (
        <LoadingSpinner />
      ) : filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <svg className="h-16 w-16 mb-4 text-slate-700" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
          </svg>
          <p className="text-lg font-medium">No tasks found</p>
          <p className="text-sm mt-1">Create a new task to get started</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={handleEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* Task Form Modal */}
      <TaskForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingTask(null); }}
        onSubmit={handleFormSubmit}
        task={editingTask}
        projects={projects}
        defaultProjectId={selectedProjectId}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Task?"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        loading={deleting}
      />
    </div>
  );
}
