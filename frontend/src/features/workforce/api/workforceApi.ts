import apiClient from '@shared/api/apiClient';
import type {
  User,
  TimeOff,
  UserSkill,
  UserAvailability,
  AddUserSkillRequest,
  SetAvailabilityRequest,
  RequestTimeOffRequest,
} from '../types/workforce.types';

export const workforceApi = {
  /** Retrieve all team members in the tenant */
  getAllUsers: () =>
    apiClient.get<User[]>('/Workforce/users').then((r) => r.data),

  getUsers: () =>
    apiClient.get<User[]>('/Workforce/users').then((r) => r.data),

  /** Invite/provision a new team member */
  inviteUser: (data: import('../types/workforce.types').InviteTeamMemberRequest) =>
    apiClient.post<User>('/Workforce/users/invite', data).then((r) => r.data),

  /** Retrieve full profile including skills, availability, and leaves */
  getUserProfile: (id: string) =>
    apiClient.get(`/Workforce/users/${id}/profile`).then((r) => r.data),

  /** Add or update proficiency skill for AI task matching */
  addSkill: (id: string, data: AddUserSkillRequest) =>
    apiClient.post<UserSkill>(`/Workforce/users/${id}/skills`, data).then((r) => r.data),

  /** Set day of week availability */
  setAvailability: (id: string, data: SetAvailabilityRequest) =>
    apiClient.post<UserAvailability>(`/Workforce/users/${id}/availability`, data).then((r) => r.data),

  /** Update user's hourly billing rate */
  updateHourlyRate: (id: string, hourlyRate: number) =>
    apiClient.put<User>(`/Workforce/users/${id}/hourly-rate`, hourlyRate).then((r) => r.data),

  /** List time off requests */
  getTimeOffs: (userId?: string) =>
    apiClient.get<TimeOff[]>('/Workforce/time-offs', { params: { userId } }).then((r) => r.data),

  /** Request time off */
  requestTimeOff: (userId: string, data: RequestTimeOffRequest) =>
    apiClient.post<TimeOff>(`/Workforce/users/${userId}/time-off`, data).then((r) => r.data),

  /** Approve time off */
  approveTimeOff: (id: string) =>
    apiClient.post<TimeOff>(`/Workforce/time-offs/${id}/approve`).then((r) => r.data),

  /** Reject time off */
  rejectTimeOff: (id: string) =>
    apiClient.post<TimeOff>(`/Workforce/time-offs/${id}/reject`).then((r) => r.data),
};
