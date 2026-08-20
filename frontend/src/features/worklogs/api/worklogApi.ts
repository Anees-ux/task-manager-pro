import apiClient from '@shared/api/apiClient';
import type { WorkLogDto, LogWorkRequest } from '../types/worklog.types';

export const worklogApi = {
  getByTask: (taskId: string) =>
    apiClient.get<WorkLogDto[]>(`/WorkLogs/task/${taskId}`).then((r) => r.data),

  logWork: (data: LogWorkRequest) =>
    apiClient.post<WorkLogDto>('/WorkLogs', data).then((r) => r.data),
};
