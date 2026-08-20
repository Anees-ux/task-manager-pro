import { Outlet, Link } from 'react-router-dom';
import { IconCpu, IconShieldLock, IconCircleDot } from '@tabler/icons-react';

interface AuthLayoutProps {
  children?: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="d-flex flex-column min-vh-100 auth-aurora-bg text-light">
      {/* Top Navbar / Brand Bar */}
      <header className="p-3 p-md-4 d-flex justify-content-between align-items-center position-relative z-1">
        <Link to="/login" className="d-flex align-items-center gap-2 text-decoration-none text-white">
          <div className="d-flex align-items-center justify-content-center p-2 rounded-3 bg-primary text-white shadow-sm">
            <IconCpu size={22} stroke={2.2} />
          </div>
          <div>
            <div className="fw-bold fs-3 tracking-tight lh-1">TaskManager<span className="text-primary">Pro</span></div>
            <div className="text-secondary small text-uppercase" style={{ fontSize: '0.65rem', letterSpacing: '0.08em' }}>
              Autonomous Execution Engine
            </div>
          </div>
        </Link>

        <div className="d-flex align-items-center gap-2 small text-secondary">
          <IconCircleDot size={10} className="text-success" />
          <span className="d-none d-sm-inline">All Systems Operational</span>
        </div>
      </header>

      {/* Main Centered Content */}
      <main className="flex-fill d-flex align-items-center justify-content-center p-3 p-md-4 position-relative z-1">
        <div className="w-100" style={{ maxWidth: '440px' }}>
          {children || <Outlet />}
        </div>
      </main>

      {/* Subtle Footer */}
      <footer className="p-3 text-center text-secondary small position-relative z-1">
        <div className="d-flex align-items-center justify-content-center gap-2">
          <IconShieldLock size={14} className="text-secondary" />
          <span>SOC-2 Type II Certified • Multi-Tenant Isolated Data Plane • 2026 Enterprise Edition</span>
        </div>
      </footer>
    </div>
  );
}

export default AuthLayout;
