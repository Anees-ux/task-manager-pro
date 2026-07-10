import apiClient from './apiClient';
import type { Project, CreateProjectRequest } from '../types/project';

export const projectService = {
  getAll: async (): Promise<Project[]> => {
    const { data } = await apiClient.get<Project[]>('/projects');
    return data;
  },

  create: async (request: CreateProjectRequest): Promise<Project> => {
    const { data } = await apiClient.post<Project>('/projects', request);
    return data;
  },
};
