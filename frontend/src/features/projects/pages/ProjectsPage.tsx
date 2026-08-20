import React, { useState } from 'react';
import { PageHeader } from '@shared/ui/PageHeader';
import { LoadingSpinner } from '@shared/ui/LoadingSpinner';
import { PremiumEmptyState } from '@shared/ui/PremiumEmptyState';
import { ProjectTable } from '../components/ProjectTable';
import { CreateProjectModal } from '../components/CreateProjectModal';
import { useProjects } from '../hooks/useProjects';
import { IconFolder, IconPlus, IconRefresh, IconAlertCircle } from '@tabler/icons-react';

export function ProjectsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const { data: projects = [], isLoading, isError, error, refetch, isRefetching } = useProjects();

  return (
    <div className="space-y-4">
      {/* Page Header with Action Controls */}
      <PageHeader
        title="Projects Command Center"
        subtitle="Manage organization milestones, budgets, and engineering velocity"
        actions={
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              className="btn btn-ghost-secondary btn-icon"
              title="Refresh Projects"
              disabled={isLoading || isRefetching}
            >
              <IconRefresh size={16} className={isRefetching ? 'animate-spin' : ''} />
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="btn btn-primary d-flex align-items-center gap-2 shadow-sm"
            >
              <IconPlus size={16} />
              <span>New Project</span>
            </button>
          </div>
        }
      />

      {/* Main Content Area */}
      <div className="mt-3">
        {isLoading ? (
          <div className="card glass-surface p-5 text-center my-3">
            <LoadingSpinner size="md" message="Synchronizing strategic project telemetry..." />
          </div>
        ) : isError ? (
          <div className="card glass-surface p-5 text-center my-3 border-danger">
            <div className="d-flex flex-column align-items-center justify-content-center text-danger">
              <IconAlertCircle size={36} className="mb-2" />
              <h4 className="fw-bold text-white mb-1">Failed to load projects</h4>
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
        ) : projects.length === 0 ? (
          <PremiumEmptyState
            icon={IconFolder}
            title="No Strategic Projects Yet"
            description="Initialize your organization's first project to start tracking budget burn rates, task lifecycles, and team capacity."
            badgeText="Projects Hub"
            badgeVariant="primary"
            actionLabel="Create First Project"
            actionIcon={IconPlus}
            onAction={() => setModalOpen(true)}
            features={['Milestone Timelines', 'Budget Utilization Tracking', 'Automated Cascade Analysis']}
          />
        ) : (
          <ProjectTable projects={projects} />
        )}
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

export default ProjectsPage;
