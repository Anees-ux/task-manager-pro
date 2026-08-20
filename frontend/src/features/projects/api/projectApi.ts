import apiClient from '@shared/api/apiClient';
import type {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectBudgetReportDto,
} from '../types/project.types';

export const projectApi = {
  /** Retrieve all projects for the current tenant */
  getProjects: () =>
    apiClient.get<Project[]>('/Projects').then((r) => r.data),

  getAll: () =>
    apiClient.get<Project[]>('/Projects').then((r) => r.data),

  /** Retrieve project by ID */
  getProjectById: (id: string) =>
    apiClient.get<Project>(`/Projects/${id}`).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<Project>(`/Projects/${id}`).then((r) => r.data),

  /** Create a new project */
  createProject: (data: CreateProjectRequest) =>
    apiClient.post<Project>('/Projects', data).then((r) => r.data),

  create: (data: CreateProjectRequest) =>
    apiClient.post<Project>('/Projects', data).then((r) => r.data),

  /** Update an existing project */
  updateProject: (id: string, data: UpdateProjectRequest) =>
    apiClient.put<Project>(`/Projects/${id}`, data).then((r) => r.data),

  update: (id: string, data: UpdateProjectRequest) =>
    apiClient.put<Project>(`/Projects/${id}`, data).then((r) => r.data),

  /** Delete / soft-delete project */
  deleteProject: (id: string) =>
    apiClient.delete(`/Projects/${id}`),

  delete: (id: string) =>
    apiClient.delete(`/Projects/${id}`),

  /** Retrieve budget report */
  getBudgetReport: (id: string) =>
    apiClient.get<ProjectBudgetReportDto>(`/Projects/${id}/budget-report`).then((r) => r.data),
};
