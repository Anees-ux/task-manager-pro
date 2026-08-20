import apiClient from '@shared/api/apiClient';
import type {
  TaskItem,
  TaskFilters,
  CreateTaskRequest,
  UpdateTaskRequest,
  AssignTaskRequest,
  ChangeTaskStatusRequest,
  ShiftDeadlineRequest,
} from '../types/task.types';

export const taskApi = {
  /** Retrieve all tasks matching optional filters */
  getTasks: (filters?: TaskFilters) =>
    apiClient.get<TaskItem[]>('/Tasks', { params: filters }).then((r) => r.data),

  getAll: (filters?: TaskFilters) =>
    apiClient.get<TaskItem[]>('/Tasks', { params: filters }).then((r) => r.data),

  /** Retrieve a single task by ID */
  getTaskById: (id: string) =>
    apiClient.get<TaskItem>(`/Tasks/${id}`).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<TaskItem>(`/Tasks/${id}`).then((r) => r.data),

  /** Create a new task */
  createTask: (data: CreateTaskRequest) =>
    apiClient.post<TaskItem>('/Tasks', data).then((r) => r.data),

  create: (data: CreateTaskRequest) =>
    apiClient.post<TaskItem>('/Tasks', data).then((r) => r.data),

  /** Update task details */
  updateTask: (id: string, data: UpdateTaskRequest) =>
    apiClient.put<TaskItem>(`/Tasks/${id}`, data).then((r) => r.data),

  update: (id: string, data: UpdateTaskRequest) =>
    apiClient.put<TaskItem>(`/Tasks/${id}`, data).then((r) => r.data),

  /** Assign task to team member */
  assignTask: (id: string, data: AssignTaskRequest) =>
    apiClient.post<TaskItem>(`/Tasks/${id}/assign`, data).then((r) => r.data),

  /** Change task lifecycle status (e.g. Kanban drop) */
  changeStatus: (id: string, data: ChangeTaskStatusRequest) =>
    apiClient.post<TaskItem>(`/Tasks/${id}/status`, data).then((r) => r.data),

  /** Shift deadline and trigger ripple effects */
  shiftDeadline: (id: string, data: ShiftDeadlineRequest) =>
    apiClient.post<TaskItem>(`/Tasks/${id}/shift-deadline`, data).then((r) => r.data),

  /** Soft-delete task */
  deleteTask: (id: string) =>
    apiClient.delete(`/Tasks/${id}`),

  delete: (id: string) =>
    apiClient.delete(`/Tasks/${id}`),
};
