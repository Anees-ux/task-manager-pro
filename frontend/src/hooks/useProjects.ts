import { useState, useCallback } from 'react';
import type { Project, CreateProjectRequest } from '../types/project';
import { projectService } from '../services/projectService';
import toast from 'react-hot-toast';

interface UseProjectsReturn {
  projects: Project[];
  loading: boolean;
  fetchProjects: () => Promise<void>;
  createProject: (request: CreateProjectRequest) => Promise<void>;
}

export function useProjects(): UseProjectsReturn {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const data = await projectService.getAll();
      setProjects(data);
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, []);

  const createProject = useCallback(async (request: CreateProjectRequest) => {
    try {
      await projectService.create(request);
      toast.success('Project created successfully!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create project';
      toast.error(message);
      throw err;
    }
  }, []);

  return { projects, loading, fetchProjects, createProject };
}
