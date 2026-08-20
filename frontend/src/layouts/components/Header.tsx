import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  IconSearch,
  IconSun,
  IconMoon,
  IconBell,
  IconSparkles,
  IconMenu2,
  IconLogout,
  IconSettings,
  IconUser,
  IconCommand,
} from '@tabler/icons-react';
import { useAuthStore } from '@stores/authStore';
import { useThemeStore } from '@stores/themeStore';
import { useUIStore } from '@stores/uiStore';
import toast from 'react-hot-toast';

export function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { user, logout } = useAuthStore();
  const { mode, toggleMode } = useThemeStore();
  const { toggleSidebar, toggleAiDrawer } = useUIStore();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Signed out successfully');
    navigate('/login', { replace: true });
  };

  const userInitial = user?.username ? user.username.charAt(0).toUpperCase() : 'U';

  return (
    <header
      className="navbar navbar-expand-md app-header-glass px-3 px-md-4 sticky-top w-100"
      style={{ height: '64px', zIndex: 1010 }}
    >
      <div className="container-fluid p-0 d-flex align-items-center justify-content-between">
        {/* Left Side: Mobile Toggle & Global Search Preview */}
        <div className="d-flex align-items-center gap-3">
          <button
            type="button"
            className="btn btn-icon btn-ghost-secondary d-lg-none"
            onClick={toggleSidebar}
            title="Toggle Sidebar"
          >
            <IconMenu2 size={20} />
          </button>

          {/* Quick Search Bar / Command Palette Trigger */}
          <div className="d-none d-md-flex align-items-center position-relative" style={{ width: '280px' }}>
            <div className="input-icon w-100">
              <span className="input-icon-addon ps-3">
                <IconSearch size={15} className="text-secondary" />
              </span>
              <input
                type="text"
                className="form-control form-control-sm pe-5 ps-5"
                placeholder="Search tasks, projects..."
                onClick={() => toast('Command palette (⌘K) quick-search ready', { icon: '🔍' })}
                readOnly
                style={{
                  cursor: 'pointer',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.06)',
                }}
              />
              <span className="input-icon-addon pe-2">
                <kbd
                  className="d-flex align-items-center gap-1 bg-dark text-secondary px-1.5 py-0.5 rounded small"
                  style={{ fontSize: '0.65rem', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <IconCommand size={10} />K
                </kbd>
              </span>
            </div>
          </div>
        </div>

        {/* Right Side Controls */}
        <div className="d-flex align-items-center gap-2">
          {/* AI Blocker Copilot Quick Trigger */}
          <button
            type="button"
            onClick={toggleAiDrawer}
            className="btn btn-sm d-flex align-items-center gap-2 px-3 rounded-pill"
            title="Open AI Blocker Copilot"
            style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.08) 100%)',
              boxShadow: 'inset 0 0 0 1px rgba(99, 102, 241, 0.35)',
              color: '#a5b4fc',
            }}
          >
            <IconSparkles size={16} className="text-primary animate-pulse" />
            <span className="d-none d-sm-inline small fw-semibold">AI Copilot</span>
          </button>

          {/* Theme Mode Toggle (Dark / Light) */}
          <button
            type="button"
            onClick={toggleMode}
            className="btn btn-icon btn-ghost-secondary rounded-circle"
            title={`Switch to ${mode === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {mode === 'dark' ? (
              <IconSun size={17} className="text-warning" />
            ) : (
              <IconMoon size={17} className="text-secondary" />
            )}
          </button>

          {/* Notifications Trigger */}
          <button
            type="button"
            className="btn btn-icon btn-ghost-secondary rounded-circle position-relative"
            onClick={() => toast('No pending notifications in this workspace', { icon: '🔔' })}
            title="Notifications"
          >
            <IconBell size={17} />
            <span
              className="position-absolute top-0 end-0 translate-middle p-1 bg-primary rounded-circle"
              style={{ marginTop: '10px', marginRight: '10px' }}
            />
          </button>

          <div className="vr mx-1 my-2 text-secondary-subtle d-none d-sm-block" style={{ opacity: 0.2 }} />

          {/* User Profile Avatar Dropdown */}
          <div className="dropdown position-relative" ref={dropdownRef}>
            <button
              type="button"
              className="btn btn-ghost-secondary p-1 d-flex align-items-center gap-2 rounded-pill"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{ boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.05)' }}
            >
              <span
                className="avatar avatar-sm rounded-circle bg-primary text-white fw-bold shadow-sm"
                style={{ width: '30px', height: '30px', fontSize: '0.8rem' }}
              >
                {userInitial}
              </span>
              <div className="d-none d-lg-block text-start pe-1">
                <div className="small fw-semibold text-white lh-1 text-truncate" style={{ maxWidth: '110px' }}>
                  {user?.username || 'Admin User'}
                </div>
                <div className="text-secondary" style={{ fontSize: '0.65rem' }}>
                  {user?.role || 'Administrator'}
                </div>
              </div>
            </button>

            {/* Dropdown Menu Panel */}
            {dropdownOpen && (
              <div
                className="dropdown-menu dropdown-menu-end show p-2 glass-surface position-absolute"
                style={{ minWidth: '230px', right: 0, top: '100%', marginTop: '10px' }}
              >
                <div className="px-3 py-2 border-bottom border-secondary-subtle mb-1">
                  <div className="fw-semibold text-white text-truncate">{user?.username}</div>
                  <div className="small text-secondary text-truncate">{user?.email || 'admin@company.com'}</div>
                  <span className="badge bg-success-subtle text-success mt-1 small" style={{ fontSize: '0.62rem' }}>
                    Active Tenant Session
                  </span>
                </div>

                <Link
                  to="/team"
                  className="dropdown-item d-flex align-items-center gap-2 rounded-2 py-2"
                  onClick={() => setDropdownOpen(false)}
                >
                  <IconUser size={15} className="text-secondary" />
                  <span>My Profile & Skills</span>
                </Link>

                <Link
                  to="/settings"
                  className="dropdown-item d-flex align-items-center gap-2 rounded-2 py-2"
                  onClick={() => setDropdownOpen(false)}
                >
                  <IconSettings size={15} className="text-secondary" />
                  <span>Workspace Settings</span>
                </Link>

                <div className="dropdown-divider my-1 border-secondary-subtle" />

                <button
                  type="button"
                  className="dropdown-item d-flex align-items-center gap-2 text-danger rounded-2 py-2 w-100 text-start"
                  onClick={handleLogout}
                >
                  <IconLogout size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
