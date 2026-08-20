import { NavLink } from 'react-router-dom';
import {
  IconCpu,
  IconLayoutDashboard,
  IconFolder,
  IconCheckbox,
  IconGitFork,
  IconUsers,
  IconFlame,
  IconShieldCheck,
  IconSparkles,
  IconSettings,
  IconChevronLeft,
  IconChevronRight,
  IconBuildingSkyscraper,
  IconChevronDown,
} from '@tabler/icons-react';
import { useUIStore } from '@stores/uiStore';
import { useAuthStore } from '@stores/authStore';

interface NavItem {
  label: string;
  to: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string | number;
  badgeVariant?: 'primary' | 'success' | 'warning' | 'purple';
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, toggleAiDrawer } = useUIStore();
  const user = useAuthStore((state) => state.user);

  const navigationSections: NavSection[] = [
    {
      title: 'Workspaces & Execution',
      items: [
        { label: 'Dashboard', to: '/', icon: IconLayoutDashboard },
        { label: 'Projects', to: '/projects', icon: IconFolder },
        { label: 'Task Engine', to: '/tasks', icon: IconCheckbox },
        { label: 'Dependencies', to: '/dependencies', icon: IconGitFork },
      ],
    },
    {
      title: 'Workforce & Capacity',
      items: [
        { label: 'Team & Roster', to: '/team', icon: IconUsers },
        { label: 'Capacity Heatmap', to: '/intelligence/heatmap', icon: IconFlame, badge: 'Live', badgeVariant: 'warning' },
      ],
    },
    {
      title: 'Autonomous Intelligence',
      items: [
        { label: 'Decision Ledger', to: '/intelligence/ledger', icon: IconShieldCheck },
        { label: 'Blocker Resolver', to: '/intelligence/resolver', icon: IconSparkles, badge: 'RAG', badgeVariant: 'purple' },
      ],
    },
    {
      title: 'Administration',
      items: [
        { label: 'Tenant Settings', to: '/settings', icon: IconSettings },
      ],
    },
  ];

  return (
    <aside
      className="navbar navbar-vertical navbar-expand-lg app-sidebar-glass transition-all d-flex flex-column"
      style={{
        width: sidebarCollapsed ? '78px' : '264px',
        minWidth: sidebarCollapsed ? '78px' : '264px',
        transition: 'width 250ms cubic-bezier(0.16, 1, 0.3, 1)',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 1020,
      }}
    >
      <div className="container-fluid p-0 d-flex flex-column h-100">
        {/* Brand / Logo Header */}
        <div
          className="navbar-brand d-flex align-items-center justify-content-between px-3 py-3 w-100"
          style={{
            height: '64px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <div className="d-flex align-items-center gap-2 overflow-hidden">
            <div
              className="d-flex align-items-center justify-content-center p-2 rounded-3 text-white shadow-sm flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, var(--tblr-primary) 0%, rgba(99, 102, 241, 0.9) 100%)',
                boxShadow: '0 0 16px -2px rgba(var(--tblr-primary-rgb), 0.5)',
              }}
            >
              <IconCpu size={20} stroke={2.2} />
            </div>
            {!sidebarCollapsed && (
              <div className="text-start overflow-hidden">
                <div className="fw-bold fs-4 tracking-tight lh-1 text-white text-truncate">
                  TaskManager<span className="text-primary">Pro</span>
                </div>
                <div
                  className="text-secondary small text-uppercase"
                  style={{ fontSize: '0.62rem', letterSpacing: '0.09em' }}
                >
                  Enterprise SaaS
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Workspace Organization Switcher Pill */}
        {!sidebarCollapsed && (
          <div className="p-3 pb-2">
            <div
              className="p-2.5 rounded-3 d-flex align-items-center justify-content-between"
              style={{
                background: 'rgba(255, 255, 255, 0.025)',
                boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.06)',
              }}
            >
              <div className="d-flex align-items-center gap-2 overflow-hidden">
                <div
                  className="p-1.5 rounded-2 text-primary flex-shrink-0"
                  style={{ background: 'rgba(var(--tblr-primary-rgb), 0.12)' }}
                >
                  <IconBuildingSkyscraper size={16} />
                </div>
                <div className="text-truncate">
                  <div className="fw-semibold small text-truncate text-white" style={{ fontSize: '0.825rem' }}>
                    {user?.tenantId ? `Tenant (${user.tenantId.substring(0, 8)})` : 'Acme Global Corp'}
                  </div>
                  <span
                    className="badge bg-primary-subtle text-primary border border-primary-subtle px-1.5 py-0"
                    style={{ fontSize: '0.6rem', letterSpacing: '0.04em' }}
                  >
                    Enterprise Tier
                  </span>
                </div>
              </div>
              <IconChevronDown size={14} className="text-secondary flex-shrink-0" />
            </div>
          </div>
        )}

        {/* Navigation Items (Scrollable) */}
        <div className="flex-fill overflow-y-auto px-2 py-2">
          {navigationSections.map((section, idx) => (
            <div key={idx} className="mb-3">
              {!sidebarCollapsed && section.title && (
                <div className="sidebar-section-header">{section.title}</div>
              )}
              <div className="nav nav-pills flex-column">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/'}
                      className={({ isActive }) =>
                        `sidebar-nav-item ${isActive ? 'active' : ''} ${
                          sidebarCollapsed ? 'justify-content-center px-0' : ''
                        }`
                      }
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <Icon size={18} className="flex-shrink-0" />
                      {!sidebarCollapsed && (
                        <span className="flex-fill text-truncate">{item.label}</span>
                      )}
                      {!sidebarCollapsed && item.badge && (
                        <span
                          className={`badge bg-${item.badgeVariant || 'primary'}-subtle text-${
                            item.badgeVariant || 'primary'
                          } ms-auto small px-1.5 py-0.5 rounded-pill`}
                          style={{ fontSize: '0.65rem' }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* AI Copilot Quick Launcher Button */}
        <div className="p-3 pt-2" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <button
            type="button"
            onClick={toggleAiDrawer}
            className={`btn w-100 d-flex align-items-center gap-2 ${
              sidebarCollapsed ? 'justify-content-center px-0' : 'px-3'
            }`}
            title="Open AI Blocker Resolver"
            style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.18) 0%, rgba(139, 92, 246, 0.08) 100%)',
              boxShadow: 'inset 0 0 0 1px rgba(99, 102, 241, 0.4), 0 4px 12px rgba(99, 102, 241, 0.15)',
              color: '#c7d2fe',
              borderRadius: '10px',
            }}
          >
            <IconSparkles size={18} className="text-primary flex-shrink-0" />
            {!sidebarCollapsed && <span className="small fw-semibold">AI Assistant</span>}
          </button>
        </div>

        {/* Sidebar Collapse Footer (Generous, Aligned Padding) */}
        <div
          className="p-3 pt-2 d-flex justify-content-center align-items-center"
          style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}
        >
          <button
            type="button"
            onClick={toggleSidebar}
            className="btn btn-sm btn-ghost-secondary w-100 d-flex align-items-center justify-content-center gap-2 text-secondary py-2"
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            style={{ borderRadius: '8px' }}
          >
            {sidebarCollapsed ? (
              <IconChevronRight size={18} />
            ) : (
              <>
                <IconChevronLeft size={16} />
                <span className="small fw-medium">Collapse Sidebar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
