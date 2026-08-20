import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProject, useProjectBudget } from '../hooks/useProjects';
import { PageHeader } from '@shared/ui/PageHeader';
import { LoadingSpinner } from '@shared/ui/LoadingSpinner';
import { PremiumEmptyState } from '@shared/ui/PremiumEmptyState';
import { StatCard } from '@shared/ui/StatCard';
import { ProjectStatus } from '@shared/types/enums';
import { formatDate } from '@shared/lib/dateUtils';
import {
  IconArrowLeft,
  IconFolder,
  IconCurrencyDollar,
  IconClock,
  IconCheck,
  IconAlertCircle,
  IconListCheck,
  IconCalendar,
  IconUser,
  IconTrendingUp,
  IconArrowRight,
  IconReceipt2,
  IconCoins,
} from '@tabler/icons-react';

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: project, isLoading: projectLoading, isError: projectError } = useProject(id);
  const { data: budgetReport, isLoading: budgetLoading } = useProjectBudget(id);

  if (!id) {
    return (
      <PremiumEmptyState
        icon={IconAlertCircle}
        title="Invalid Project ID"
        description="No project identifier was supplied in the route."
        actionLabel="Back to Projects"
        onAction={() => navigate('/projects')}
      />
    );
  }

  if (projectLoading || budgetLoading) {
    return (
      <div className="card glass-surface p-5 text-center my-4">
        <LoadingSpinner size="md" message="Synchronizing project telemetry and financials..." />
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <PremiumEmptyState
        icon={IconFolder}
        title="Project Not Found"
        description="The requested project could not be found or has been removed from this workspace."
        actionLabel="Return to Projects"
        onAction={() => navigate('/projects')}
      />
    );
  }

  const budgetAllocated = project.budgetAllocated ?? 0;
  const budgetConsumed = project.budgetConsumed ?? 0;
  const remainingBudget = Math.max(0, budgetAllocated - budgetConsumed);
  const budgetPercent = budgetAllocated > 0 ? Math.min(100, Math.round((budgetConsumed / budgetAllocated) * 100)) : 0;

  const totalTasks = budgetReport?.totalTasks ?? project.taskCount ?? 0;
  const completedTasks = budgetReport?.completedTasks ?? 0;
  const taskCompletionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.Active:
        return (
          <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1 rounded-pill small d-inline-flex align-items-center gap-1.5 fw-semibold">
            <span className="p-1 rounded-circle bg-success d-inline-block shadow-sm" style={{ width: '6px', height: '6px' }} />
            Active Milestone
          </span>
        );
      case ProjectStatus.Completed:
        return (
          <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2.5 py-1 rounded-pill small d-inline-flex align-items-center gap-1.5 fw-semibold">
            <IconCheck size={13} />
            Completed
          </span>
        );
      case ProjectStatus.OnHold:
        return (
          <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-2.5 py-1 rounded-pill small d-inline-flex align-items-center gap-1.5 fw-semibold">
            <IconClock size={13} />
            On Hold
          </span>
        );
      default:
        return (
          <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2.5 py-1 rounded-pill small d-inline-flex align-items-center gap-1.5 fw-semibold">
            <IconAlertCircle size={13} />
            Planning
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Navigation with Back Button */}
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
        <div className="d-flex align-items-center gap-3">
          <Link
            to="/projects"
            className="btn btn-ghost-secondary d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-2"
            title="Return to Projects List"
          >
            <IconArrowLeft size={16} />
            <span className="small fw-medium">All Projects</span>
          </Link>
          <div className="vr text-secondary-subtle" style={{ height: '24px' }} />
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-primary-subtle text-primary font-monospace px-2 py-0.5 border border-primary-subtle">
              {project.projectCode}
            </span>
            {getStatusBadge(project.status)}
          </div>
        </div>

        <Link
          to={`/tasks?projectId=${project.id}`}
          className="btn btn-primary d-inline-flex align-items-center gap-2 shadow-sm px-3"
        >
          <IconListCheck size={16} />
          <span>Open Task Engine</span>
        </Link>
      </div>

      {/* Hero Title Section */}
      <div className="card glass-surface p-4 p-md-5 mb-4 position-relative overflow-hidden">
        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 position-relative z-1">
          <div>
            <div className="d-flex align-items-center gap-2.5 mb-2">
              <div className="p-2 rounded-3 bg-primary-subtle text-primary border border-primary-subtle">
                <IconFolder size={22} />
              </div>
              <h1 className="h2 fw-bold text-body mb-0 tracking-tight">{project.name}</h1>
            </div>
            <p className="text-secondary small mb-0" style={{ maxWidth: '650px', lineHeight: '1.6' }}>
              {project.description || 'No strategic description provided for this project.'}
            </p>
          </div>
        </div>
      </div>

      {/* Bento Grid Row 1: Financial Telemetry (Reusing StatCard Component) */}
      <div className="row row-deck row-cards mb-4">
        <div className="col-sm-6 col-lg-3">
          <StatCard
            title="Allocated Budget"
            value={`$${budgetAllocated.toLocaleString()}`}
            trend="Total Cap"
            trendDirection="neutral"
            trendColor="#60a5fa"
            icon={IconCurrencyDollar}
            color="primary"
          />
        </div>
        <div className="col-sm-6 col-lg-3">
          <StatCard
            title="Budget Consumed"
            value={`$${budgetConsumed.toLocaleString()}`}
            trend={`${budgetPercent}% consumed`}
            trendDirection="up"
            trendColor={budgetPercent > 90 ? '#f87171' : budgetPercent > 75 ? '#fbbf24' : '#34d399'}
            icon={IconReceipt2}
            color={budgetPercent > 90 ? 'warning' : 'primary'}
          />
        </div>
        <div className="col-sm-6 col-lg-3">
          <StatCard
            title="Remaining Budget"
            value={`$${remainingBudget.toLocaleString()}`}
            trend={remainingBudget > 0 ? 'Healthy Run-Rate' : 'Budget Depleted'}
            trendDirection={remainingBudget > 0 ? 'up' : 'down'}
            trendColor={remainingBudget > 0 ? '#34d399' : '#f87171'}
            icon={IconCoins}
            color="success"
          />
        </div>
        <div className="col-sm-6 col-lg-3">
          <StatCard
            title="Total Hours Logged"
            value={`${budgetReport?.totalHoursLogged ?? 0}h`}
            trend={`${totalTasks} Total Tasks`}
            trendDirection="up"
            trendColor="#c084fc"
            icon={IconClock}
            color="purple"
          />
        </div>
      </div>

      {/* Bento Grid Row 2: Details & Engineering Execution */}
      <div className="row row-cards">
        {/* Left Card: Project Metadata & Governance */}
        <div className="col-lg-5">
          <div className="card p-4 h-100 shadow-sm">
            <h3 className="card-title fw-bold text-body mb-3 d-flex align-items-center gap-2">
              <IconFolder size={19} className="text-primary" />
              <span>Project Governance & Schedule</span>
            </h3>

            <div className="space-y-3">
              <div className="d-flex justify-content-between align-items-center py-2 border-bottom border-secondary-subtle">
                <span className="text-secondary small">Project Code</span>
                <span className="font-monospace fw-bold text-primary small">{project.projectCode}</span>
              </div>

              <div className="d-flex justify-content-between align-items-center py-2 border-bottom border-secondary-subtle">
                <span className="text-secondary small">Project Manager</span>
                <span className="text-body small fw-semibold d-flex align-items-center gap-1.5">
                  <IconUser size={15} className="text-secondary" />
                  {project.projectManagerId ? 'Assigned Lead' : 'Unassigned'}
                </span>
              </div>

              <div className="d-flex justify-content-between align-items-center py-2 border-bottom border-secondary-subtle">
                <span className="text-secondary small">Start Date</span>
                <span className="text-body small fw-medium d-flex align-items-center gap-1.5">
                  <IconCalendar size={15} className="text-secondary" />
                  {formatDate(project.startDate, 'MMM dd, yyyy')}
                </span>
              </div>

              <div className="d-flex justify-content-between align-items-center py-2 border-bottom border-secondary-subtle">
                <span className="text-secondary small">Target Deadline</span>
                <span className="text-body small fw-medium d-flex align-items-center gap-1.5">
                  <IconClock size={15} className="text-secondary" />
                  {formatDate(project.deadlineUtc, 'MMM dd, yyyy')}
                </span>
              </div>

              <div className="d-flex justify-content-between align-items-center py-2">
                <span className="text-secondary small">Created At</span>
                <span className="text-muted small">
                  {formatDate(project.createdAtUtc, 'MMM dd, yyyy')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Task Execution & Progress Breakdown */}
        <div className="col-lg-7">
          <div className="card p-4 h-100 shadow-sm">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h3 className="card-title fw-bold text-body mb-0 d-flex align-items-center gap-2">
                <IconListCheck size={19} className="text-success" />
                <span>Task Execution & Milestone Progress</span>
              </h3>
              <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1 rounded-pill small fw-bold">
                {taskCompletionPercent}% Completed
              </span>
            </div>

            <p className="text-secondary small mb-3">
              Progress tracking across all active and finished engineering tasks tied to <strong>{project.name}</strong>.
            </p>

            {/* Task Completion Progress Bar */}
            <div className="mb-4">
              <div className="d-flex justify-content-between small text-secondary mb-1">
                <span>{completedTasks} completed</span>
                <span className="text-body fw-bold">{totalTasks} total tasks</span>
              </div>
              <div
                className="progress progress-sm bg-body-secondary border border-secondary-subtle"
                style={{ height: '8px', borderRadius: '9999px' }}
              >
                <div
                  className="progress-bar bg-success"
                  style={{ width: `${taskCompletionPercent}%`, borderRadius: '9999px' }}
                />
              </div>
            </div>

            {/* Telemetry Metric Cards */}
            <div className="row g-3 mb-4">
              <div className="col-4">
                <div className="p-3 rounded-3 bg-body-tertiary border border-secondary-subtle text-center">
                  <div className="text-secondary small text-uppercase" style={{ fontSize: '0.65rem' }}>Total Tasks</div>
                  <div className="h2 fw-bold text-body mb-0">{totalTasks}</div>
                </div>
              </div>
              <div className="col-4">
                <div className="p-3 rounded-3 bg-body-tertiary border border-secondary-subtle text-center">
                  <div className="text-secondary small text-uppercase" style={{ fontSize: '0.65rem' }}>Completed</div>
                  <div className="h2 fw-bold text-success mb-0">{completedTasks}</div>
                </div>
              </div>
              <div className="col-4">
                <div className="p-3 rounded-3 bg-body-tertiary border border-secondary-subtle text-center">
                  <div className="text-secondary small text-uppercase" style={{ fontSize: '0.65rem' }}>Pending</div>
                  <div className="h2 fw-bold text-warning mb-0">{Math.max(0, totalTasks - completedTasks)}</div>
                </div>
              </div>
            </div>

            {/* CTA to Task Engine */}
            <div className="mt-auto pt-2">
              <Link
                to={`/tasks?projectId=${project.id}`}
                className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2 py-2"
              >
                <span>View All Project Tasks in Kanban Engine</span>
                <IconArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectDetailPage;
