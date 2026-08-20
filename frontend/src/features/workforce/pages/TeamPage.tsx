import React, { useState } from 'react';
import { useWorkforceAllocations } from '../hooks/useWorkforce';
import { PageHeader } from '@shared/ui/PageHeader';
import { LoadingSpinner } from '@shared/ui/LoadingSpinner';
import { PremiumEmptyState } from '@shared/ui/PremiumEmptyState';
import { StatCard } from '@shared/ui/StatCard';
import { RosterTimelineGrid } from '../components/RosterTimelineGrid';
import { AddTeamMemberModal } from '../components/AddTeamMemberModal';
import {
  IconUsers,
  IconCalendarEvent,
  IconChartBar,
  IconPlaneDeparture,
  IconUserPlus,
} from '@tabler/icons-react';

export function TeamPage() {
  const { users, allocations, timeOffs, isLoading } = useWorkforceAllocations();
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const filteredUsers = users.filter(
    (u) =>
      !searchQuery ||
      (u.fullName && u.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalAllocations = allocations.length;
  const avgLoad =
    allocations.length > 0
      ? Math.round(
          allocations.reduce((acc, curr) => acc + curr.allocationPercent, 0) /
            allocations.length
        )
      : 0;

  const activeLeaves = timeOffs.filter((t) => t.status === 'Approved').length;

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <PageHeader
        title="Workforce & Resource Scheduler"
        subtitle="Multi-day timeline allocation, weekly rosters, and capacity balance"
        actions={
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="btn btn-primary d-flex align-items-center gap-2 shadow-sm"
            >
              <IconUserPlus size={16} />
              <span>Add Team Member</span>
            </button>
          </div>
        }
      />

      {/* Top Telemetry KPI Cards */}
      <div className="row row-deck row-cards mb-3">
        <div className="col-sm-6 col-lg-3">
          <StatCard
            title="Total Workforce"
            value={users.length}
            trend={`${users.filter((u) => u.isActive).length} Active`}
            trendDirection="up"
            trendColor="#60a5fa"
            icon={IconUsers}
            color="primary"
          />
        </div>
        <div className="col-sm-6 col-lg-3">
          <StatCard
            title="Active Task Allocations"
            value={totalAllocations}
            trend="Milestone Streams"
            trendDirection="neutral"
            trendColor="#34d399"
            icon={IconCalendarEvent}
            color="success"
          />
        </div>
        <div className="col-sm-6 col-lg-3">
          <StatCard
            title="Avg Capacity Load"
            value={`${avgLoad}%`}
            trend={avgLoad > 85 ? 'High Load' : 'Optimal Capacity'}
            trendDirection={avgLoad > 85 ? 'up' : 'neutral'}
            trendColor={avgLoad > 85 ? '#fbbf24' : '#34d399'}
            icon={IconChartBar}
            color={avgLoad > 85 ? 'warning' : 'primary'}
          />
        </div>
        <div className="col-sm-6 col-lg-3">
          <StatCard
            title="Scheduled Leaves"
            value={activeLeaves}
            trend="Approved Vacations"
            trendDirection="neutral"
            trendColor="#c084fc"
            icon={IconPlaneDeparture}
            color="purple"
          />
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="card glass-surface p-3 mb-3 shadow-sm border-0">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-6">
            <input
              type="text"
              className="form-control"
              placeholder="Filter workforce by name, username, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main Timeline Grid */}
      <div>
        {isLoading ? (
          <div className="card glass-surface p-5 text-center my-3">
            <LoadingSpinner size="md" message="Synchronizing workforce schedules and timeline allocations..." />
          </div>
        ) : users.length === 0 ? (
          <PremiumEmptyState
            icon={IconUsers}
            title="No Team Members Found"
            description="Provision team members or configure workforce rosters to visualize resource allocations on the timeline."
            badgeText="Workforce Operations"
            badgeVariant="primary"
            actionLabel="Invite Team Member"
            actionIcon={IconUserPlus}
            onAction={() => setModalOpen(true)}
            features={['Multi-Day Gantt Timelines', 'Over-Allocation Guardrails', 'Time-Off Approvals']}
          />
        ) : (
          <RosterTimelineGrid
            users={filteredUsers}
            allocations={allocations}
            timeOffs={timeOffs}
          />
        )}
      </div>

      {/* Add Team Member Modal */}
      <AddTeamMemberModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

export default TeamPage;
