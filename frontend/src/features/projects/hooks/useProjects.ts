import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectApi } from '../api/projectApi';
import type { CreateProjectRequest, UpdateProjectRequest } from '../types/project.types';
import toast from 'react-hot-toast';

export const PROJECT_KEYS = {
  all: ['projects'] as const,
  lists: () => [...PROJECT_KEYS.all, 'list'] as const,
  detail: (id: string) => [...PROJECT_KEYS.all, 'detail', id] as const,
  budget: (id: string) => [...PROJECT_KEYS.all, 'budget', id] as const,
};

/**
 * Hook to retrieve all projects for the active tenant workspace.
 */
export function useProjects() {
  return useQuery({
    queryKey: PROJECT_KEYS.all,
    queryFn: projectApi.getProjects,
  });
}

/**
 * Hook to retrieve a single project by ID.
 */
export function useProject(id?: string) {
  return useQuery({
    queryKey: PROJECT_KEYS.detail(id ?? ''),
    queryFn: () => projectApi.getProjectById(id!),
    enabled: Boolean(id),
  });
}

/**
 * Hook to retrieve project budget report.
 */
export function useProjectBudget(id?: string) {
  return useQuery({
    queryKey: PROJECT_KEYS.budget(id ?? ''),
    queryFn: () => projectApi.getBudgetReport(id!),
    enabled: Boolean(id),
  });
}

/**
 * Hook to create a new project with cache invalidation & toast notification.
 */
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectRequest) => projectApi.createProject(data),
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.all });
      toast.success(`Project "${newProject.name}" created successfully! 🚀`);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.response?.data || 'Failed to create project.';
      toast.error(typeof msg === 'string' ? msg : 'Error creating project.');
    },
  });
}

/**
 * Hook to update an existing project.
 */
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectRequest }) =>
      projectApi.updateProject(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.all });
      toast.success(`Project "${updated.name}" updated successfully!`);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.response?.data || 'Failed to update project.';
      toast.error(typeof msg === 'string' ? msg : 'Error updating project.');
    },
  });
}

/**
 * Hook to delete a project.
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectApi.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.all });
      toast.success('Project deleted successfully.');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.response?.data || 'Failed to delete project.';
      toast.error(typeof msg === 'string' ? msg : 'Error deleting project.');
    },
  });
}
