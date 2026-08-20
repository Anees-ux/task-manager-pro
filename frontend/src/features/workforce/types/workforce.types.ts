// ─── Workforce & Capacity Feature Types (Mirrors WorkforceDto.cs) ──────
import type { UserRole, ProficiencyLevel, TimeOffType, TimeOffStatus } from '@shared/types/enums';

export interface User {
  id: string; // C# Guid serialized as string
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  hourlyRate: number;
  isActive: boolean;
  avatarUrl?: string | null;
  createdAtUtc: string;
}

export type UserDto = User;

export interface UserSkill {
  id: string;
  userId: string;
  skillName: string;
  proficiency: ProficiencyLevel;
  yearsOfExperience: number;
}

export type UserSkillDto = UserSkill;

export interface UserAvailability {
  id: string;
  userId: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string;
  endTime: string;
  availableHours: number;
}

export type UserAvailabilityDto = UserAvailability;

export interface TimeOff {
  id: string;
  userId: string;
  userName: string;
  startDate: string;
  endDate: string;
  type: TimeOffType;
  status: TimeOffStatus;
  reason: string | null;
  totalDays: number;
  createdAtUtc: string;
}

export type TimeOffDto = TimeOff;

export interface Allocation {
  id: string;
  userId: string;
  taskId: string;
  taskName: string;
  taskCode: string;
  projectName?: string | null;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  allocationPercent: number; // e.g. 100 = 100% capacity
  priority?: string;
  estimatedHours?: number;
}

export interface AddUserSkillRequest {
  skillName: string;
  proficiency: ProficiencyLevel;
  yearsOfExperience: number;
}

export interface SetAvailabilityRequest {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface RequestTimeOffRequest {
  startDate: string;
  endDate: string;
  type: TimeOffType;
  reason?: string | null;
}

export interface InviteTeamMemberRequest {
  fullName: string;
  email: string;
  role: UserRole;
  department: string;
  hourlyRate: number;
  skills?: string;
}
