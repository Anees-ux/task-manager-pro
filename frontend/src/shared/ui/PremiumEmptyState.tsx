import React from 'react';
import { IconSparkles, IconArrowRight } from '@tabler/icons-react';

interface PremiumEmptyStateProps {
  icon: React.ComponentType<{ size?: number; stroke?: number; className?: string }>;
  title: string;
  description: string;
  badgeText?: string;
  badgeVariant?: 'primary' | 'purple' | 'success' | 'warning';
  actionLabel?: string;
  actionIcon?: React.ComponentType<{ size?: number; className?: string }>;
  onAction?: () => void;
  features?: string[];
}

export function PremiumEmptyState({
  icon: Icon,
  title,
  description,
  badgeText = 'Architecture Module Ready',
  badgeVariant = 'primary',
  actionLabel,
  actionIcon: ActionIcon = IconArrowRight,
  onAction,
  features,
}: PremiumEmptyStateProps) {
  return (
    <div className="card glass-surface p-5 text-center my-4 position-relative overflow-hidden">
      {/* Ambient Inner Glow Background */}
      <div
        className="position-absolute top-50 start-50 translate-middle pointer-events-none"
        style={{
          width: '350px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(var(--tblr-primary-rgb), 0.12) 0%, transparent 70%)',
          filter: 'blur(40px)',
          zIndex: 0,
        }}
      />

      <div className="position-relative z-1 d-flex flex-column align-items-center justify-content-center py-3">
        {/* Glowing Icon Orb */}
        <div className="mb-4 position-relative">
          <div
            className="d-flex align-items-center justify-content-center rounded-circle shadow-lg"
            style={{
              width: '72px',
              height: '72px',
              background: 'linear-gradient(135deg, rgba(var(--tblr-primary-rgb), 0.2) 0%, rgba(99, 102, 241, 0.08) 100%)',
              boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.12), 0 8px 24px -4px rgba(var(--tblr-primary-rgb), 0.3)',
            }}
          >
            <Icon size={34} stroke={1.8} className="text-primary" />
          </div>
        </div>

        {/* Status Badge */}
        {badgeText && (
          <div className="mb-3">
            <span
              className={`badge bg-${badgeVariant}-subtle text-${badgeVariant} px-3 py-1 rounded-pill small fw-semibold`}
              style={{
                boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.08)',
                fontSize: '0.72rem',
                letterSpacing: '0.04em',
              }}
            >
              <IconSparkles size={12} className="me-1" />
              {badgeText}
            </span>
          </div>
        )}

        {/* Title & Description */}
        <h2 className="h2 fw-bold text-white mb-2 tracking-tight">{title}</h2>
        <p
          className="text-secondary mx-auto mb-4"
          style={{ maxWidth: '520px', fontSize: '0.925rem', lineHeight: '1.6' }}
        >
          {description}
        </p>

        {/* Action Button */}
        {actionLabel && (
          <button
            type="button"
            onClick={onAction}
            className="btn btn-primary d-inline-flex align-items-center gap-2 px-4 py-2 mb-3 shadow-sm"
          >
            <span>{actionLabel}</span>
            <ActionIcon size={16} />
          </button>
        )}

        {/* Feature Capability Tags */}
        {features && features.length > 0 && (
          <div className="d-flex flex-wrap justify-content-center gap-2 mt-2 pt-3 border-top border-secondary-subtle w-100" style={{ maxWidth: '600px' }}>
            {features.map((feat, i) => (
              <span
                key={i}
                className="px-2 py-1 rounded-2 bg-body-tertiary text-secondary small"
                style={{ fontSize: '0.75rem', boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.05)' }}
              >
                &bull; {feat}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
