// ─── Project Feature Types (Mirrors ProjectDto.cs) ─────────────────────
import type { ProjectStatus } from '@shared/types/enums';

export interface Project {
  id: string; // C# Guid serialized as string
  name: string;
  description: string | null;
  projectCode: string;
  status: ProjectStatus;
  budgetAllocated: number;
  budgetConsumed: number;
  budgetUtilizationPercent: number;
  startDate: string | null;
  deadlineUtc: string | null;
  projectManagerId: string | null;
  createdAtUtc: string;
  taskCount: number;
}

// Type alias for backward/forward compatibility
export type ProjectDto = Project;

export interface CreateProjectRequest {
  name: string;
  description?: string | null;
  projectCode: string;
  budgetAllocated?: number;
  startDate?: string | null;
  deadlineUtc?: string | null;
  projectManagerId?: string | null;
}

export interface UpdateProjectRequest {
  name: string;
  description?: string | null;
  status: ProjectStatus;
  budgetAllocated: number;
  startDate?: string | null;
  deadlineUtc?: string | null;
  projectManagerId?: string | null;
}

export interface ProjectBudgetReportDto {
  projectId: string;
  projectName: string;
  projectCode: string;
  budgetAllocated: number;
  budgetConsumed: number;
  budgetUtilizationPercent: number;
  remainingBudget: number;
  totalTasks: number;
  completedTasks: number;
  totalHoursLogged: number;
}
