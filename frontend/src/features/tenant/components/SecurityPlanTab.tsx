import React from 'react';
import { useTenant, useUpgradeSubscription } from '../hooks/useTenant';
import { SubscriptionTier } from '@shared/types/enums';
import type { Tenant } from '../types/tenant.types';
import {
  IconShieldLock,
  IconCrown,
  IconCheck,
  IconShieldCheck,
  IconUsers,
  IconFolder,
  IconSparkles,
  IconLock,
} from '@tabler/icons-react';

interface SecurityPlanTabProps {
  tenant?: Tenant | null;
}

export function SecurityPlanTab({ tenant: propTenant }: SecurityPlanTabProps) {
  const { data: queriedTenant } = useTenant();
  const upgradeMutation = useUpgradeSubscription();

  const tenant = propTenant ?? queriedTenant;
  const currentTier = tenant?.tier ?? SubscriptionTier.Enterprise;

  // Quota Metrics (e.g. Users 1/50, Projects 4/25)
  const maxUsers = tenant?.maxUsers ?? 50;
  const currentUsers = 1;
  const userPercent = Math.min(100, Math.round((currentUsers / maxUsers) * 100));

  const maxProjects = tenant?.maxProjects ?? 25;
  const currentProjects = 4;
  const projectPercent = Math.min(100, Math.round((currentProjects / maxProjects) * 100));

  const handleUpgrade = (tier: SubscriptionTier) => {
    upgradeMutation.mutate({ newTier: tier });
  };

  return (
    <div className="card glass-surface p-4 p-md-5 shadow-sm border-0 space-y-4">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between pb-3 border-bottom border-secondary-subtle flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2.5">
          <div className="p-2 rounded-3 bg-primary-subtle text-primary border border-primary-subtle">
            <IconShieldLock size={20} />
          </div>
          <div>
            <h3 className="h4 fw-bold text-body mb-0">Subscription Plan & Security Compliance</h3>
            <p className="text-secondary small mb-0">
              Manage multi-tenant isolation, enterprise quota limits, and security seals
            </p>
          </div>
        </div>

        <span className="badge bg-primary text-white font-monospace px-3 py-1.5 rounded-pill small fw-bold d-flex align-items-center gap-1.5 shadow-sm">
          <IconCrown size={15} />
          <span>{currentTier} Tier</span>
        </span>
      </div>

      {/* Quota & Usage Progress Bars (Users 1/50, Projects 4/25) */}
      <div>
        <h4 className="fw-bold text-body small text-uppercase mb-3" style={{ letterSpacing: '0.06em' }}>
          Resource Utilization & Capacity Quotas
        </h4>

        <div className="row g-3">
          {/* Workforce Users Quota */}
          <div className="col-sm-6 col-lg-4">
            <div className="p-3.5 rounded-3 bg-body-tertiary border border-secondary-subtle">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="small text-secondary fw-semibold d-flex align-items-center gap-1.5">
                  <IconUsers size={16} className="text-primary" />
                  <span>Workforce Users</span>
                </span>
                <span className="text-body fw-bold small">
                  {currentUsers} / {maxUsers}
                </span>
              </div>
              <div className="progress progress-xs mb-1" style={{ height: '6px' }}>
                <div
                  className="progress-bar bg-primary"
                  style={{ width: `${Math.max(4, userPercent)}%`, borderRadius: '9999px' }}
                />
              </div>
              <div className="text-muted small text-end" style={{ fontSize: '0.68rem' }}>
                {userPercent}% consumed
              </div>
            </div>
          </div>

          {/* Strategic Projects Quota */}
          <div className="col-sm-6 col-lg-4">
            <div className="p-3.5 rounded-3 bg-body-tertiary border border-secondary-subtle">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="small text-secondary fw-semibold d-flex align-items-center gap-1.5">
                  <IconFolder size={16} className="text-success" />
                  <span>Active Projects</span>
                </span>
                <span className="text-body fw-bold small">
                  {currentProjects} / {maxProjects}
                </span>
              </div>
              <div className="progress progress-xs mb-1" style={{ height: '6px' }}>
                <div
                  className="progress-bar bg-success"
                  style={{ width: `${Math.max(4, projectPercent)}%`, borderRadius: '9999px' }}
                />
              </div>
              <div className="text-muted small text-end" style={{ fontSize: '0.68rem' }}>
                {projectPercent}% consumed
              </div>
            </div>
          </div>

          {/* AI Neural Reasoning Budget */}
          <div className="col-sm-12 col-lg-4">
            <div className="p-3.5 rounded-3 bg-body-tertiary border border-secondary-subtle">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="small text-secondary fw-semibold d-flex align-items-center gap-1.5">
                  <IconSparkles size={16} className="text-purple" />
                  <span>RAG Vector Queries</span>
                </span>
                <span className="text-body fw-bold small">
                  14.2k / 50k
                </span>
              </div>
              <div className="progress progress-xs mb-1" style={{ height: '6px' }}>
                <div
                  className="progress-bar bg-purple"
                  style={{ width: '28%', borderRadius: '9999px' }}
                />
              </div>
              <div className="text-muted small text-end" style={{ fontSize: '0.68rem' }}>
                28% monthly budget
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Available Subscription Tiers */}
      <div>
        <h4 className="fw-bold text-body small text-uppercase mb-3" style={{ letterSpacing: '0.06em' }}>
          Enterprise Subscription Management
        </h4>

        <div className="row g-3">
          {/* Pro Tier */}
          <div className="col-md-6">
            <div className="p-4 rounded-3 bg-body border border-secondary-subtle h-100 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <h5 className="fw-bold text-body mb-0">Professional Tier</h5>
                  <span className="text-primary fw-bold small">$49 / mo</span>
                </div>
                <p className="text-secondary small mb-3">
                  Tailored for growing engineering teams with automated capacity balancing.
                </p>
                <ul className="list-unstyled space-y-2 text-secondary small mb-4">
                  <li className="d-flex align-items-center gap-2">
                    <IconCheck size={14} className="text-success" />
                    <span>Up to 25 Workforce Seats</span>
                  </li>
                  <li className="d-flex align-items-center gap-2">
                    <IconCheck size={14} className="text-success" />
                    <span>Multi-Day Roster Timeline Grid</span>
                  </li>
                  <li className="d-flex align-items-center gap-2">
                    <IconCheck size={14} className="text-success" />
                    <span>Runtime Custom CSS Variable Theming</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => handleUpgrade(SubscriptionTier.Pro)}
                className={`btn w-100 ${currentTier === SubscriptionTier.Pro ? 'btn-outline-secondary' : 'btn-outline-primary'}`}
                disabled={currentTier === SubscriptionTier.Pro || upgradeMutation.isPending}
              >
                {currentTier === SubscriptionTier.Pro ? 'Current Active Tier' : 'Switch to Pro'}
              </button>
            </div>
          </div>

          {/* Enterprise Tier */}
          <div className="col-md-6">
            <div className="p-4 rounded-3 bg-body border border-primary-subtle h-100 d-flex flex-column justify-content-between shadow-sm position-relative overflow-hidden">
              <div>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <h5 className="fw-bold text-body mb-0">Enterprise SaaS Plane</h5>
                  <span className="badge bg-primary-subtle text-primary border border-primary-subtle small fw-bold">
                    Active License
                  </span>
                </div>
                <p className="text-secondary small mb-3">
                  Full autonomous capability with Gemini 3.5 Flash RAG and Pinecone Vector Memory.
                </p>
                <ul className="list-unstyled space-y-2 text-secondary small mb-4">
                  <li className="d-flex align-items-center gap-2">
                    <IconCheck size={14} className="text-success" />
                    <span>Unlimited Users & Strategic Projects</span>
                  </li>
                  <li className="d-flex align-items-center gap-2">
                    <IconCheck size={14} className="text-success" />
                    <span>Autonomous Neural Decision Ledger</span>
                  </li>
                  <li className="d-flex align-items-center gap-2">
                    <IconCheck size={14} className="text-success" />
                    <span>Dedicated Pinecone Vector Memory Index</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => handleUpgrade(SubscriptionTier.Enterprise)}
                className={`btn w-100 ${currentTier === SubscriptionTier.Enterprise ? 'btn-primary' : 'btn-outline-primary'}`}
                disabled={currentTier === SubscriptionTier.Enterprise || upgradeMutation.isPending}
              >
                {currentTier === SubscriptionTier.Enterprise ? 'Active Enterprise License' : 'Upgrade to Enterprise'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sleek SOC-2 Compliance Badge */}
      <div className="p-3.5 rounded-3 bg-body-tertiary border border-secondary-subtle d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2.5">
          <div className="p-2 rounded-2 bg-success-subtle text-success border border-success-subtle d-flex align-items-center justify-content-center">
            <IconShieldCheck size={18} />
          </div>
          <div>
            <div className="fw-bold text-body small">SOC-2 Type II & Multi-Tenant Isolation Seal</div>
            <div className="text-secondary small" style={{ fontSize: '0.72rem' }}>
              All database records and vector embeddings are encrypted at rest with AES-256 and transmitted via TLS 1.3.
            </div>
          </div>
        </div>

        <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1 rounded-pill small fw-bold d-inline-flex align-items-center gap-1">
          <IconLock size={12} />
          <span>Verified Compliant</span>
        </span>
      </div>
    </div>
  );
}
