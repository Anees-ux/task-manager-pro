import apiClient from './apiClient';
import type { TaskItem, CreateTaskRequest, UpdateTaskRequest } from '../types/task';
import { TaskItemStatus, Priority } from '../types/task';

interface GetTasksParams {
  status?: TaskItemStatus;
  priority?: Priority;
  projectId?: number;
}

export const taskService = {
  getAll: async (params?: GetTasksParams): Promise<TaskItem[]> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.priority) queryParams.append('priority', params.priority);
    if (params?.projectId) queryParams.append('projectId', params.projectId.toString());

    const url = queryParams.toString() ? `/tasks?${queryParams}` : '/tasks';
    const { data } = await apiClient.get<TaskItem[]>(url);
    return data;
  },

  getById: async (id: number): Promise<TaskItem> => {
    const { data } = await apiClient.get<TaskItem>(`/tasks/${id}`);
    return data;
  },

  create: async (request: CreateTaskRequest): Promise<TaskItem> => {
    const { data } = await apiClient.post<TaskItem>('/tasks', request);
    return data;
  },

  update: async (id: number, request: UpdateTaskRequest): Promise<TaskItem> => {
    const { data } = await apiClient.put<TaskItem>(`/tasks/${id}`, request);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/tasks/${id}`);
  },
};
