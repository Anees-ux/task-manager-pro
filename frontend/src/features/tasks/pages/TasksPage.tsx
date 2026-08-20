import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import { useProjects } from '@features/projects/hooks/useProjects';
import { PageHeader } from '@shared/ui/PageHeader';
import { LoadingSpinner } from '@shared/ui/LoadingSpinner';
import { PremiumEmptyState } from '@shared/ui/PremiumEmptyState';
import { TaskBoard } from '../components/TaskBoard';
import { CreateTaskModal } from '../components/CreateTaskModal';
import { Priority, TaskItemStatus } from '@shared/types/enums';
import {
  IconCheckbox,
  IconPlus,
  IconSearch,
  IconFilter,
  IconRefresh,
  IconAlertCircle,
} from '@tabler/icons-react';

export function TasksPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const projectParam = searchParams.get('projectId') || '';

  const [modalOpen, setModalOpen] = useState(false);
  const [modalInitialStatus, setModalInitialStatus] = useState<TaskItemStatus | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(projectParam);
  const [selectedPriority, setSelectedPriority] = useState<string>('');

  const { data: projects = [] } = useProjects();
  const {
    data: tasks = [],
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useTasks(selectedProjectId ? { projectId: selectedProjectId } : undefined);

  // Client-side filtering for fast interactive search & priority filtering
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesSearch =
        !searchQuery ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.taskCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesPriority =
        !selectedPriority || t.priority === selectedPriority;

      return matchesSearch && matchesPriority;
    });
  }, [tasks, searchQuery, selectedPriority]);

  const handleProjectFilterChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    if (projectId) {
      setSearchParams({ projectId });
    } else {
      setSearchParams({});
    }
  };

  const handleOpenCreateModal = (initialStatus?: TaskItemStatus) => {
    setModalInitialStatus(initialStatus);
    setModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <PageHeader
        title="Intelligent Task Engine"
        subtitle="High-velocity Kanban board with automated Ripple Effect cascades and skill routing"
        actions={
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              className="btn btn-ghost-secondary btn-icon"
              title="Refresh Tasks"
              disabled={isLoading || isRefetching}
            >
              <IconRefresh size={16} className={isRefetching ? 'animate-spin' : ''} />
            </button>
            <button
              type="button"
              onClick={() => handleOpenCreateModal()}
              className="btn btn-primary d-flex align-items-center gap-2 shadow-sm"
            >
              <IconPlus size={16} />
              <span>New Task</span>
            </button>
          </div>
        }
      />

      {/* Filter & Search Bar */}
      <div className="card glass-surface p-3 mb-3 shadow-sm border-0">
        <div className="row g-2 align-items-center">
          {/* Search Input */}
          <div className="col-12 col-md-5">
            <div className="input-icon">
              <span className="input-icon-addon">
                <IconSearch size={16} />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search tasks by code, title, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Project Filter */}
          <div className="col-6 col-md-4">
            <div className="input-icon">
              <span className="input-icon-addon">
                <IconFilter size={16} />
              </span>
              <select
                className="form-select"
                value={selectedProjectId}
                onChange={(e) => handleProjectFilterChange(e.target.value)}
              >
                <option value="">All Projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.projectCode}] {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority Filter */}
          <div className="col-6 col-md-3">
            <select
              className="form-select"
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value={Priority.Critical}>Critical</option>
              <option value={Priority.High}>High</option>
              <option value={Priority.Medium}>Medium</option>
              <option value={Priority.Low}>Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Board View */}
      <div>
        {isLoading ? (
          <div className="card glass-surface p-5 text-center my-3">
            <LoadingSpinner size="md" message="Synchronizing task state and lifecycle board..." />
          </div>
        ) : isError ? (
          <div className="card glass-surface p-5 text-center my-3 border-danger">
            <div className="d-flex flex-column align-items-center justify-content-center text-danger">
              <IconAlertCircle size={36} className="mb-2" />
              <h4 className="fw-bold text-body mb-1">Failed to load tasks</h4>
              <p className="text-secondary small mb-3">
                {(error as any)?.message || 'An error occurred while connecting to the backend API.'}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="btn btn-outline-danger btn-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : tasks.length === 0 && !selectedProjectId && !searchQuery ? (
          <PremiumEmptyState
            icon={IconCheckbox}
            title="No Tasks Created Yet"
            description="Create your first engineering task to initiate autonomous capacity tracking and Kanban board state."
            badgeText="Task Engine"
            badgeVariant="primary"
            actionLabel="Create First Task"
            actionIcon={IconPlus}
            onAction={() => handleOpenCreateModal()}
            features={['Drag-and-Drop Workflow', 'Capacity Heatmap Balancing', 'Ripple Cascade Shifting']}
          />
        ) : (
          <TaskBoard
            tasks={filteredTasks}
            onNewTaskClick={(status) => handleOpenCreateModal(status)}
          />
        )}
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultProjectId={selectedProjectId}
        defaultStatus={modalInitialStatus}
      />
    </div>
  );
}

export default TasksPage;
