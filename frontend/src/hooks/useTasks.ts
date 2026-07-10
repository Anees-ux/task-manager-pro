import { useState, useCallback } from 'react';
import type { TaskItem, CreateTaskRequest, UpdateTaskRequest } from '../types/task';
import { TaskItemStatus, Priority } from '../types/task';
import { taskService } from '../services/taskService';
import toast from 'react-hot-toast';

interface UseTasksReturn {
  tasks: TaskItem[];
  loading: boolean;
  error: string | null;
  fetchTasks: (filters?: { status?: TaskItemStatus; priority?: Priority; projectId?: number }) => Promise<void>;
  createTask: (request: CreateTaskRequest) => Promise<void>;
  updateTask: (id: number, request: UpdateTaskRequest) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
}

export function useTasks(): UseTasksReturn {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async (filters?: { status?: TaskItemStatus; priority?: Priority; projectId?: number }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await taskService.getAll(filters);
      setTasks(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch tasks';
      setError(message);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = useCallback(async (request: CreateTaskRequest) => {
    try {
      await taskService.create(request);
      toast.success('Task created successfully!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create task';
      toast.error(message);
      throw err;
    }
  }, []);

  const updateTask = useCallback(async (id: number, request: UpdateTaskRequest) => {
    try {
      await taskService.update(id, request);
      toast.success('Task updated successfully!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update task';
      toast.error(message);
      throw err;
    }
  }, []);

  const deleteTask = useCallback(async (id: number) => {
    try {
      await taskService.delete(id);
      setTasks(prev => prev.filter(t => t.id !== id));
      toast.success('Task deleted successfully!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete task';
      toast.error(message);
      throw err;
    }
  }, []);

  return { tasks, loading, error, fetchTasks, createTask, updateTask, deleteTask };
}
