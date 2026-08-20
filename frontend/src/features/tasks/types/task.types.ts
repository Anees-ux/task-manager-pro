// ─── Task Feature Types (Mirrors TaskItemDto.cs) ────────────────────────
import type { TaskItemStatus, Priority } from '@shared/types/enums';

export interface TaskItem {
  id: string; // C# Guid serialized as string
  title: string;
  description: string | null;
  taskCode: string;
  status: TaskItemStatus;
  priority: Priority;
  projectId: string;
  projectName: string | null;
  assigneeId: string | null;
  assigneeName: string | null;
  reporterId: string | null;
  estimatedHours: number;
  actualHours: number;
  startDateUtc: string | null;
  dueDateUtc: string | null;
  completedAtUtc: string | null;
  requiredSkills: string | null;
  createdAtUtc: string;
  isOverdue: boolean;
}

export type TaskItemDto = TaskItem;

export interface TaskFilters {
  status?: TaskItemStatus;
  priority?: Priority;
  projectId?: string;
  assigneeId?: string;
  search?: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string | null;
  taskCode: string;
  projectId: string;
  priority?: Priority;
  estimatedHours?: number;
  dueDateUtc?: string | null;
  assigneeId?: string | null;
  requiredSkills?: string | null;
}

export interface UpdateTaskRequest {
  title: string;
  description?: string | null;
  priority: Priority;
  estimatedHours: number;
  dueDateUtc?: string | null;
  requiredSkills?: string | null;
}

export interface AssignTaskRequest {
  assigneeId: string;
}

export interface ChangeTaskStatusRequest {
  status: TaskItemStatus;
}

export interface ShiftDeadlineRequest {
  newDeadlineUtc: string | null;
  reason: string;
}
