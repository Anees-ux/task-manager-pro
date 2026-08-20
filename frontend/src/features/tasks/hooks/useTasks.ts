import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '../api/taskApi';
import type { TaskItem, TaskFilters, CreateTaskRequest, UpdateTaskRequest } from '../types/task.types';
import type { TaskItemStatus } from '@shared/types/enums';
import toast from 'react-hot-toast';

export const TASK_KEYS = {
  all: ['tasks'] as const,
  lists: () => [...TASK_KEYS.all, 'list'] as const,
  list: (filters?: TaskFilters) => [...TASK_KEYS.lists(), filters] as const,
  detail: (id: string) => [...TASK_KEYS.all, 'detail', id] as const,
};

/**
 * Hook to retrieve tasks with optional filters.
 */
export function useTasks(filters?: TaskFilters) {
  return useQuery({
    queryKey: TASK_KEYS.list(filters),
    queryFn: () => taskApi.getTasks(filters),
  });
}

/**
 * Hook to retrieve a single task by ID.
 */
export function useTask(id?: string) {
  return useQuery({
    queryKey: TASK_KEYS.detail(id ?? ''),
    queryFn: () => taskApi.getTaskById(id!),
    enabled: Boolean(id),
  });
}

/**
 * Hook to create a task with cache invalidation & toast notification.
 */
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskRequest) => taskApi.createTask(data),
    onSuccess: (newTask) => {
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.all });
      toast.success(`Task "${newTask.taskCode}" created! 🚀`);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.response?.data || 'Failed to create task.';
      toast.error(typeof msg === 'string' ? msg : 'Error creating task.');
    },
  });
}

/**
 * Hook to change a task's status with OPTIMISTIC UI UPDATES for smooth Kanban dragging.
 */
export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskItemStatus }) =>
      taskApi.changeStatus(taskId, { status }),

    // Optimistically update the UI before the API call finishes
    onMutate: async ({ taskId, status }) => {
      await queryClient.cancelQueries({ queryKey: TASK_KEYS.all });

      // Snapshot all cached queries matching tasks
      const previousTasks = queryClient.getQueryData<TaskItem[]>(TASK_KEYS.list());

      // Optimistically update the cache
      queryClient.setQueriesData<TaskItem[]>({ queryKey: TASK_KEYS.all }, (old) => {
        if (!old) return [];
        return old.map((task) => (task.id === taskId ? { ...task, status } : task));
      });

      return { previousTasks };
    },

    // If API call fails, roll back to snapshot
    onError: (err: any, _vars, context) => {
      if (context?.previousTasks) {
        queryClient.setQueriesData({ queryKey: TASK_KEYS.all }, context.previousTasks);
      }
      const msg = err?.response?.data?.message || 'Failed to move task. Reverting state.';
      toast.error(typeof msg === 'string' ? msg : 'Error updating task status.');
    },

    // Always invalidate to ensure backend alignment
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.all });
    },
  });
}

/**
 * Hook to update an existing task's details.
 */
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskRequest }) =>
      taskApi.updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.all });
      toast.success('Task updated successfully.');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to update task.';
      toast.error(typeof msg === 'string' ? msg : 'Error updating task.');
    },
  });
}

/**
 * Hook to delete a task.
 */
export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => taskApi.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.all });
      toast.success('Task removed.');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to delete task.';
      toast.error(typeof msg === 'string' ? msg : 'Error deleting task.');
    },
  });
}
