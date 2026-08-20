import React from 'react';
import { IconTrendingUp, IconTrendingDown, IconMinus } from '@tabler/icons-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  trendColor?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color?: 'primary' | 'success' | 'warning' | 'purple' | 'info';
}

export function StatCard({
  title,
  value,
  trend,
  trendDirection = 'up',
  trendColor = '#34d399', // Bright neon emerald for dark theme contrast
  icon: Icon,
  color = 'primary',
}: StatCardProps) {
  const TrendIcon =
    trendDirection === 'up'
      ? IconTrendingUp
      : trendDirection === 'down'
      ? IconTrendingDown
      : IconMinus;

  const colorKey = color === 'purple' ? 'purple' : color;

  return (
    <div className="card p-3.5 shadow-sm h-100 position-relative overflow-hidden">
      {/* Top Row: Title and Icon Badge */}
      <div className="d-flex align-items-center justify-content-between mb-2.5">
        <span
          className="text-secondary small fw-bold text-uppercase"
          style={{ fontSize: '0.675rem', letterSpacing: '0.07em' }}
        >
          {title}
        </span>
        <div
          className={`p-2 rounded-3 bg-${colorKey}-subtle text-${colorKey}`}
          style={{
            boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.08)',
          }}
        >
          <Icon size={17} />
        </div>
      </div>

      {/* Main Metric Value */}
      <div className="h1 fw-bold mb-1.5 text-white tracking-tight">{value}</div>

      {/* Trend Row with High-Contrast Neon Accents */}
      {trend && (
        <div className="d-flex align-items-center gap-1.5 small">
          <TrendIcon size={14} style={{ color: trendColor }} />
          <span
            className="fw-semibold"
            style={{ color: trendColor, fontSize: '0.78rem', letterSpacing: '0.01em' }}
          >
            {trend}
          </span>
        </div>
      )}
    </div>
  );
}
