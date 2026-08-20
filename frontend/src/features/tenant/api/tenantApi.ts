import apiClient from '@shared/api/apiClient';
import type {
  Tenant,
  TenantSettings,
  UpdateTenantSettingsRequest,
  UpgradeSubscriptionRequest,
} from '../types/tenant.types';

export const tenantApi = {
  /** Retrieve current tenant info and settings */
  getCurrentTenant: () =>
    apiClient.get<Tenant>('/Tenants/me').then((r) => r.data),

  getMe: () =>
    apiClient.get<Tenant>('/Tenants/me').then((r) => r.data),

  /** Update tenant-wide organization settings */
  updateSettings: (data: UpdateTenantSettingsRequest) =>
    apiClient.put<TenantSettings>('/Tenants/settings', data).then((r) => r.data),

  /** Upgrade workspace subscription tier */
  upgradeSubscription: (data: UpgradeSubscriptionRequest) =>
    apiClient.post<Tenant>('/Tenants/upgrade', data).then((r) => r.data),
};
