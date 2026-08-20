import {
  IconFolder,
  IconCheckbox,
  IconFlame,
  IconShieldCheck,
  IconSparkles,
  IconArrowUpRight,
} from '@tabler/icons-react';
import { useAuthStore } from '@stores/authStore';
import { useUIStore } from '@stores/uiStore';
import { Link } from 'react-router-dom';
import { StatCard, type StatCardProps } from '@shared/ui/StatCard';

export function DashboardPlaceholder() {
  const user = useAuthStore((state) => state.user);
  const toggleAiDrawer = useUIStore((state) => state.toggleAiDrawer);

  const stats: StatCardProps[] = [
    {
      title: 'Active Projects',
      value: '4',
      trend: '+2 this month',
      trendDirection: 'up',
      trendColor: '#34d399', // Bright neon emerald
      icon: IconFolder,
      color: 'primary',
    },
    {
      title: 'Tasks in Progress',
      value: '28',
      trend: '8 due this week',
      trendDirection: 'up',
      trendColor: '#60a5fa', // Bright electric blue
      icon: IconCheckbox,
      color: 'success',
    },
    {
      title: 'Team Utilization',
      value: '78%',
      trend: 'Optimal Capacity',
      trendDirection: 'up',
      trendColor: '#fbbf24', // Amber gold
      icon: IconFlame,
      color: 'warning',
    },
    {
      title: 'AI Decisions Audited',
      value: '142',
      trend: '98% confidence',
      trendDirection: 'up',
      trendColor: '#c084fc', // Neon purple
      icon: IconShieldCheck,
      color: 'purple',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Welcome Banner */}
      <div className="card glass-surface p-4 p-md-5 mb-4 position-relative overflow-hidden">
        {/* Subtle Ambient Radial Glow */}
        <div
          className="position-absolute top-0 end-0 translate-middle-y pointer-events-none"
          style={{
            width: '450px',
            height: '450px',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, transparent 70%)',
            filter: 'blur(55px)',
            zIndex: 0,
          }}
        />

        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 position-relative z-1">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span
                className="badge bg-primary-subtle text-primary px-2.5 py-1 rounded-pill small fw-semibold"
                style={{ boxShadow: 'inset 0 0 0 1px rgba(var(--tblr-primary-rgb), 0.25)', fontSize: '0.7rem' }}
              >
                <IconSparkles size={12} className="me-1" />
                Autonomous SaaS Data Plane
              </span>
            </div>
            <h1 className="h2 fw-bold text-white mb-1 tracking-tight">
              Welcome back, {user?.username || 'Executive'} 👋
            </h1>
            <p className="text-secondary small mb-0" style={{ maxWidth: '600px', lineHeight: '1.6' }}>
              Your workspace capacity models and neural decision ledgers are fully synchronized with Pinecone and Gemini.
            </p>
          </div>

          <div className="d-flex gap-2.5 flex-shrink-0">
            {/* Upgraded AI-Powered Glowing Button */}
            <button
              type="button"
              onClick={toggleAiDrawer}
              className="btn btn-ai-gradient d-flex align-items-center gap-2 px-3.5 py-2 shadow-sm"
            >
              <IconSparkles size={17} className="animate-pulse" />
              <span>Ask AI Copilot</span>
            </button>
            <Link
              to="/tasks"
              className="btn btn-ghost-secondary d-flex align-items-center gap-2 px-3"
              style={{ boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.08)' }}
            >
              <span>Task Engine</span>
              <IconArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards Grid (Using Reusable StatCard Component) */}
      <div className="row row-deck row-cards mb-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="col-sm-6 col-lg-3">
            <StatCard {...stat} />
          </div>
        ))}
      </div>

      {/* Quick Launchpad Panels */}
      <div className="row row-cards">
        {/* Capacity Heatmap Status Card */}
        <div className="col-md-6">
          <div className="card p-4 h-100">
            <h3 className="card-title fw-bold text-white mb-2 d-flex align-items-center gap-2">
              <IconFlame size={20} className="text-warning" />
              <span>Capacity Heatmap Distribution</span>
            </h3>
            <p className="text-secondary small mb-3" style={{ lineHeight: '1.5' }}>
              Workforce distribution is balanced across all active milestones. 2 team members approaching 90% allocation limit.
            </p>

            {/* Segmented Pill Progress Bar */}
            <div className="segmented-progress-track mb-3">
              <div
                className="segmented-progress-segment bg-success"
                style={{ width: '70%' }}
                title="Optimal Capacity (70%)"
              />
              <div
                className="segmented-progress-segment bg-warning"
                style={{ width: '18%' }}
                title="Near Limit (18%)"
              />
              <div
                className="segmented-progress-segment bg-danger"
                style={{ width: '12%' }}
                title="Overloaded (12%)"
              />
            </div>

            {/* Fixed Micro-Spacing on Heatmap Legend */}
            <div className="d-flex flex-wrap gap-4 text-secondary small pt-1">
              <div className="d-flex align-items-center gap-2" style={{ fontSize: '0.78rem' }}>
                <span className="p-1 rounded-circle bg-success d-inline-block shadow-sm" style={{ width: '8px', height: '8px' }} />
                <span>Available (70%)</span>
              </div>
              <div className="d-flex align-items-center gap-2" style={{ fontSize: '0.78rem' }}>
                <span className="p-1 rounded-circle bg-warning d-inline-block shadow-sm" style={{ width: '8px', height: '8px' }} />
                <span>Near Limit (18%)</span>
              </div>
              <div className="d-flex align-items-center gap-2" style={{ fontSize: '0.78rem' }}>
                <span className="p-1 rounded-circle bg-danger d-inline-block shadow-sm" style={{ width: '8px', height: '8px' }} />
                <span>Overloaded (12%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Neural Decision Ledger Card */}
        <div className="col-md-6">
          <div className="card p-4 h-100">
            <h3 className="card-title fw-bold text-white mb-2 d-flex align-items-center gap-2">
              <IconShieldCheck size={20} className="text-primary" />
              <span>Neural Decision Ledger</span>
            </h3>
            <p className="text-secondary small mb-3" style={{ lineHeight: '1.5' }}>
              Last AI decision: <strong>Task #TSK-001</strong> was auto-routed based on skill matrix matching (Score: 0.94).
            </p>
            <div
              className="p-3 rounded-3 small font-monospace text-secondary mb-3"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.06)',
                fontSize: '0.75rem',
              }}
            >
              Action: Auto-Assign &bull; Engine: Gemini 3.5 Flash &bull; Status: <span className="text-success fw-bold">Approved</span>
            </div>
            <Link to="/intelligence/ledger" className="btn btn-sm btn-ghost-primary align-self-start px-0 text-primary">
              Open Decision Ledger &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
