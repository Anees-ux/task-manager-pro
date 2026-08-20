// ─── Shared UI: Page Header ─────────────────────────────────────────────

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="page-header d-print-none">
      <div className="container-xl">
        <div className="page-header-content d-flex align-items-center justify-content-between">
          <div>
            <h2 className="page-title">{title}</h2>
            {subtitle && <div className="text-secondary mt-1">{subtitle}</div>}
          </div>
          {actions && <div className="d-flex gap-2">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
