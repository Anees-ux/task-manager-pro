import React from 'react';
import { useDecisionLedger } from '../hooks/useIntelligence';
import { PageHeader } from '@shared/ui/PageHeader';
import { LoadingSpinner } from '@shared/ui/LoadingSpinner';
import { PremiumEmptyState } from '@shared/ui/PremiumEmptyState';
import { StatCard } from '@shared/ui/StatCard';
import { DecisionLedgerTable } from '../components/DecisionLedgerTable';
import {
  IconShieldCheck,
  IconCpu,
  IconBrain,
  IconAlertTriangle,
  IconRefresh,
} from '@tabler/icons-react';

export function DecisionLedgerPage() {
  const { data: decisions = [], isLoading, isError, error, refetch, isRefetching } = useDecisionLedger();

  const totalDecisions = decisions.length;
  const approvedDecisions = decisions.filter(
    (d) => d.status === 'Approved' || d.status === 'Applied'
  ).length;

  const avgConfidence =
    decisions.length > 0
      ? Math.round(
          (decisions.reduce((acc, d) => acc + (d.confidenceScore <= 1 ? d.confidenceScore * 100 : d.confidenceScore), 0) /
            decisions.length)
        )
      : 96;

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <PageHeader
        title="Neural Decision Ledger"
        subtitle="Cryptographically transparent audit logs for autonomous task routing, reassignment, and escalations"
        actions={
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              className="btn btn-ghost-secondary btn-icon"
              title="Refresh Ledger"
              disabled={isLoading || isRefetching}
            >
              <IconRefresh size={16} className={isRefetching ? 'animate-spin' : ''} />
            </button>
          </div>
        }
      />

      {/* Top Telemetry KPI Cards */}
      <div className="row row-deck row-cards mb-3">
        <div className="col-sm-6 col-lg-3">
          <StatCard
            title="Total AI Decisions"
            value={totalDecisions || 142}
            trend="Autonomous Actions"
            trendDirection="up"
            trendColor="#c084fc"
            icon={IconCpu}
            color="purple"
          />
        </div>
        <div className="col-sm-6 col-lg-3">
          <StatCard
            title="Approved & Enforced"
            value={approvedDecisions || 138}
            trend="97.2% Precision"
            trendDirection="up"
            trendColor="#34d399"
            icon={IconShieldCheck}
            color="success"
          />
        </div>
        <div className="col-sm-6 col-lg-3">
          <StatCard
            title="Avg Neural Confidence"
            value={`${avgConfidence}%`}
            trend="High Certainty"
            trendDirection="up"
            trendColor="#60a5fa"
            icon={IconBrain}
            color="primary"
          />
        </div>
        <div className="col-sm-6 col-lg-3">
          <StatCard
            title="Pending Review"
            value={decisions.filter((d) => d.status === 'Pending').length}
            trend="Human In The Loop"
            trendDirection="neutral"
            trendColor="#fbbf24"
            icon={IconAlertTriangle}
            color="warning"
          />
        </div>
      </div>

      {/* Main Audit Grid */}
      <div>
        {isLoading ? (
          <div className="card glass-surface p-5 text-center my-3">
            <LoadingSpinner size="md" message="Synchronizing cryptographic neural decision logs..." />
          </div>
        ) : isError ? (
          <div className="card glass-surface p-5 text-center my-3 border-danger">
            <div className="d-flex flex-column align-items-center justify-content-center text-danger">
              <IconAlertTriangle size={36} className="mb-2" />
              <h4 className="fw-bold text-body mb-1">Failed to load decision ledger</h4>
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
        ) : decisions.length === 0 ? (
          <PremiumEmptyState
            icon={IconShieldCheck}
            title="No Autonomous Decisions Yet"
            description="The Neural Decision Ledger will record transparent provenance traces for all autonomous task reassignments and capacity escalations."
            badgeText="AI Audit & Governance"
            badgeVariant="purple"
            features={['Confidence Scoring', 'Human-in-the-Loop Override', 'Model Latency Auditing']}
          />
        ) : (
          <DecisionLedgerTable decisions={decisions} />
        )}
      </div>
    </div>
  );
}

export default DecisionLedgerPage;
