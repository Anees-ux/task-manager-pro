import { Outlet } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { useUIStore } from '@stores/uiStore';

export function DashboardLayout() {
  const { sidebarCollapsed, setSidebarCollapsed } = useUIStore();

  return (
    <div className="d-flex min-vh-100 bg-body text-body">
      {/* Primary Vertical Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area Shell */}
      <div className="d-flex flex-column flex-fill min-vh-100 overflow-hidden">
        {/* Top Header Navigation */}
        <Header />

        {/* Dynamic Page Content Wrapper */}
        <main className="flex-fill p-3 p-md-4 overflow-y-auto" style={{ backgroundColor: 'var(--tblr-body-bg)' }}>
          <div className="container-xl p-0">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay Backdrop */}
      {!sidebarCollapsed && (
        <div
          className="d-lg-none position-fixed top-0 start-0 w-100 h-100 bg-black bg-opacity-50"
          style={{ zIndex: 1015 }}
          onClick={() => setSidebarCollapsed(true)}
        />
      )}
    </div>
  );
}

export default DashboardLayout;
