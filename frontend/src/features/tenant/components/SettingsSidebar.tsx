import React from 'react';
import type { SettingsTabId } from '../types/tenant.types';
import {
  IconSettings,
  IconPalette,
  IconBrain,
  IconShieldLock,
} from '@tabler/icons-react';

interface SettingsSidebarProps {
  activeTab: SettingsTabId;
  onSelectTab: (tab: SettingsTabId) => void;
}

interface TabItem {
  id: SettingsTabId;
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const TABS: TabItem[] = [
  {
    id: 'general',
    label: 'General & Timezones',
    description: 'Workspace timezone and work hour guardrails',
    icon: IconSettings,
  },
  {
    id: 'branding',
    label: 'Brand & Theming',
    description: 'Real-time CSS variable color injection',
    icon: IconPalette,
  },
  {
    id: 'ai-engine',
    label: 'AI Autonomous Engine',
    description: 'Auto-assignment and neural confidence controls',
    icon: IconBrain,
  },
  {
    id: 'security',
    label: 'Plan & Security',
    description: 'Multi-tenant subscription tier and SOC-2 access',
    icon: IconShieldLock,
  },
];

export function SettingsSidebar({ activeTab, onSelectTab }: SettingsSidebarProps) {
  return (
    <div className="list-group list-group-transparent space-y-1">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectTab(tab.id)}
            className={`list-group-item list-group-item-action d-flex align-items-center gap-3 p-3 rounded-3 transition-fast border-0 text-start ${
              isActive
                ? 'bg-primary-subtle text-primary fw-semibold'
                : 'text-body hover-bg-body-secondary'
            }`}
            style={{
              boxShadow: isActive ? 'inset 0 0 0 1px rgba(var(--tblr-primary-rgb), 0.25)' : 'none',
            }}
          >
            <div
              className={`p-2 rounded-2.5 d-flex align-items-center justify-content-center flex-shrink-0 ${
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-body-tertiary text-secondary border border-secondary-subtle'
              }`}
              style={{ width: '36px', height: '36px' }}
            >
              <Icon size={18} />
            </div>
            <div className="overflow-hidden">
              <div className="small fw-bold text-truncate" style={{ fontSize: '0.85rem' }}>
                {tab.label}
              </div>
              <div className="text-muted small text-truncate" style={{ fontSize: '0.72rem' }}>
                {tab.description}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
