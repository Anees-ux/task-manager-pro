// ─── Tenant & Settings Feature Types (Mirrors TenantDto.cs) ─────────────
import type {
  SubscriptionTier,
  OverAllocationPolicy,
  AiApprovalMode,
} from '@shared/types/enums';

export interface TenantSettings {
  id?: string;
  timezone: string;
  defaultWorkHoursPerDay: number;
  overAllocationPolicy: OverAllocationPolicy;
  aiAutoAssignEnabled: boolean;
  aiApprovalMode: AiApprovalMode;
  aiConfidenceThreshold: number; // e.g. 0.85
  primaryColor?: string;
  accentColor?: string;
}

export type TenantSettingsDto = TenantSettings;

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  tier: SubscriptionTier;
  maxUsers: number;
  maxProjects: number;
  subscriptionExpiresAtUtc: string;
  isActive: boolean;
  settings?: TenantSettings | null;
}

export type TenantDto = Tenant;

export interface UpdateTenantSettingsRequest {
  timezone: string;
  defaultWorkHoursPerDay: number;
  overAllocationPolicy: OverAllocationPolicy;
  aiAutoAssignEnabled: boolean;
  aiApprovalMode: AiApprovalMode;
  aiConfidenceThreshold: number;
  primaryColor?: string;
  accentColor?: string;
}

export interface UpgradeSubscriptionRequest {
  newTier: SubscriptionTier;
}

export type SettingsTabId = 'general' | 'branding' | 'ai-engine' | 'security';
