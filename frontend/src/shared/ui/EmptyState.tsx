// ─── Shared UI: Empty State ──────────────────────────────────────────────
import { IconMoodEmpty } from '@tabler/icons-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({
  title = 'No data found',
  message = 'There are no items to display.',
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="empty">
      <div className="empty-icon">
        {icon || <IconMoodEmpty size={48} stroke={1.5} />}
      </div>
      <p className="empty-title">{title}</p>
      <p className="empty-subtitle text-secondary">{message}</p>
      {action && <div className="empty-action">{action}</div>}
    </div>
  );
}
