import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workforceApi } from '../api/workforceApi';
import { useTasks } from '@features/tasks/hooks/useTasks';
import type { Allocation, AddUserSkillRequest, RequestTimeOffRequest } from '../types/workforce.types';
import toast from 'react-hot-toast';

export const WORKFORCE_KEYS = {
  all: ['workforce'] as const,
  users: () => [...WORKFORCE_KEYS.all, 'users'] as const,
  profile: (id: string) => [...WORKFORCE_KEYS.all, 'profile', id] as const,
  timeOffs: (userId?: string) => [...WORKFORCE_KEYS.all, 'time-offs', userId] as const,
  allocations: () => [...WORKFORCE_KEYS.all, 'allocations'] as const,
};

/**
 * Hook to retrieve all team members in the tenant.
 */
export function useTeamRoster() {
  return useQuery({
    queryKey: WORKFORCE_KEYS.users(),
    queryFn: workforceApi.getAllUsers,
  });
}

/**
 * Hook to retrieve individual user profile.
 */
export function useUserProfile(id?: string) {
  return useQuery({
    queryKey: WORKFORCE_KEYS.profile(id ?? ''),
    queryFn: () => workforceApi.getUserProfile(id!),
    enabled: Boolean(id),
  });
}

/**
 * Hook to retrieve all time-off records.
 */
export function useTimeOffs(userId?: string) {
  return useQuery({
    queryKey: WORKFORCE_KEYS.timeOffs(userId),
    queryFn: () => workforceApi.getTimeOffs(userId),
  });
}

/**
 * Hook that maps active tasks and time-offs into multi-day timeline allocations.
 */
export function useWorkforceAllocations() {
  const { data: tasks = [], isLoading: tasksLoading } = useTasks();
  const { data: users = [], isLoading: usersLoading } = useTeamRoster();
  const { data: timeOffs = [], isLoading: timeOffsLoading } = useTimeOffs();

  // Synthesize task allocations per user
  const allocations: Allocation[] = tasks
    .filter((task) => task.assigneeId)
    .map((task) => {
      const today = new Date().toISOString().split('T')[0];
      const startDate = task.startDateUtc
        ? task.startDateUtc.split('T')[0]
        : today;
      const endDate = task.dueDateUtc
        ? task.dueDateUtc.split('T')[0]
        : startDate;

      // Estimate allocation percentage based on daily hours vs 8h standard day
      const dailyHours = task.estimatedHours > 0 ? Math.min(8, task.estimatedHours / 2) : 4;
      const allocationPercent = Math.round((dailyHours / 8) * 100);

      return {
        id: `alloc-${task.id}`,
        userId: task.assigneeId!,
        taskId: task.id,
        taskName: task.title,
        taskCode: task.taskCode,
        projectName: task.projectName,
        startDate,
        endDate,
        allocationPercent: Math.min(100, Math.max(20, allocationPercent)),
        priority: task.priority,
        estimatedHours: task.estimatedHours,
      };
    });

  return {
    allocations,
    users,
    timeOffs,
    isLoading: tasksLoading || usersLoading || timeOffsLoading,
  };
}

/**
 * Hook to request time off.
 */
export function useRequestTimeOff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: RequestTimeOffRequest }) =>
      workforceApi.requestTimeOff(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKFORCE_KEYS.all });
      toast.success('Time off request submitted.');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to submit time off request.';
      toast.error(typeof msg === 'string' ? msg : 'Error requesting time off.');
    },
  });
}

/**
 * Hook to add or update user skill.
 */
export function useAddSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: AddUserSkillRequest }) =>
      workforceApi.addSkill(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKFORCE_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['workforce'] });
      toast.success('Skill proficiency recorded for AI matching.');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to add skill.';
      toast.error(typeof msg === 'string' ? msg : 'Error adding skill.');
    },
  });
}

/**
 * Hook to invite/provision a new team member.
 */
export function useInviteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: import('../types/workforce.types').InviteTeamMemberRequest) =>
      workforceApi.inviteUser(data),
    onSuccess: (newUser) => {
      queryClient.invalidateQueries({ queryKey: WORKFORCE_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['workforce'] });
      toast.success(`Invitation sent to ${newUser.email}! ✉️`);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to invite team member.';
      toast.error(typeof msg === 'string' ? msg : 'Error inviting team member.');
    },
  });
}
