import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from '@layouts/AuthLayout';
import { DashboardLayout } from '@layouts/DashboardLayout';
import { AuthGuard } from '@app/guards/AuthGuard';

import { LoginPage } from '@features/auth/pages/LoginPage';
import { RegisterPage } from '@features/auth/pages/RegisterPage';
import { DashboardPlaceholder } from '@features/dashboard/DashboardPlaceholder';
import { PremiumEmptyState } from '@shared/ui/PremiumEmptyState';

import {
  IconFolder,
  IconCheckbox,
  IconGitFork,
  IconUsers,
  IconFlame,
  IconShieldCheck,
  IconSparkles,
  IconSettings,
  IconPlus,
} from '@tabler/icons-react';

import { ProjectsPage } from '@features/projects/pages/ProjectsPage';
import { ProjectDetailPage } from '@features/projects/pages/ProjectDetailPage';
import { TasksPage } from '@features/tasks/pages/TasksPage';
import { TeamPage } from '@features/workforce/pages/TeamPage';

import { BlockerResolverPage } from '@features/intelligence/pages/BlockerResolverPage';
import { DecisionLedgerPage } from '@features/intelligence/pages/DecisionLedgerPage';

import { SettingsPage } from '@features/tenant/pages/SettingsPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Authentication Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected Application Routes */}
        <Route
          element={
            <AuthGuard>
              <DashboardLayout />
            </AuthGuard>
          }
        >
          <Route path="/" element={<DashboardPlaceholder />} />

          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />

          <Route path="/tasks" element={<TasksPage />} />

          <Route
            path="/dependencies"
            element={
              <PremiumEmptyState
                icon={IconGitFork}
                title="Task Dependency Graph"
                description="Visualize critical path bottlenecks with automated Finish-to-Start dependency validation."
                badgeText="Cascade Dependency Graph"
                badgeVariant="warning"
                actionLabel="Link Dependencies"
                features={['Bottleneck Detection', 'Lag Days Calculation', 'Topological Sorting']}
              />
            }
          />

          <Route path="/team" element={<TeamPage />} />

          <Route
            path="/intelligence/heatmap"
            element={
              <PremiumEmptyState
                icon={IconFlame}
                title="Capacity Heatmap Engine"
                description="Predictive load-balancing telemetry to identify over-allocated team members before bottlenecks occur."
                badgeText="Autonomous Capacity Engine"
                badgeVariant="warning"
                actionLabel="Run Heatmap Simulation"
                features={['14-Day Lookahead Window', 'Over-Allocation Guardrails', 'Leave Impact Analysis']}
              />
            }
          />

          <Route path="/intelligence/ledger" element={<DecisionLedgerPage />} />
          <Route path="/intelligence/resolver" element={<BlockerResolverPage />} />

          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
