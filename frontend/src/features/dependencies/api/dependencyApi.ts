import apiClient from '@shared/api/apiClient';
import type { TaskDependencyDto, CreateTaskDependencyRequest } from '../types/dependency.types';

export const dependencyApi = {
  getByTask: (taskId: string) =>
    apiClient.get<TaskDependencyDto[]>(`/Dependencies/task/${taskId}`).then((r) => r.data),

  create: (data: CreateTaskDependencyRequest) =>
    apiClient.post<TaskDependencyDto>('/Dependencies', data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/Dependencies/${id}`),
};
