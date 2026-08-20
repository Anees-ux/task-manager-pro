import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantApi } from '../api/tenantApi';
import { useThemeStore } from '@stores/themeStore';
import type { UpdateTenantSettingsRequest, UpgradeSubscriptionRequest } from '../types/tenant.types';
import toast from 'react-hot-toast';

export const TENANT_KEYS = {
  all: ['tenant'] as const,
  current: () => [...TENANT_KEYS.all, 'current'] as const,
};

/**
 * Hook to retrieve current tenant workspace data and configuration.
 */
export function useTenant() {
  return useQuery({
    queryKey: TENANT_KEYS.current(),
    queryFn: tenantApi.getCurrentTenant,
  });
}

/**
 * Hook to update tenant settings with real-time feedback & cache sync.
 */
export function useUpdateTenantSettings() {
  const queryClient = useQueryClient();
  const setPrimaryColor = useThemeStore((state) => state.setPrimaryColor);

  return useMutation({
    mutationFn: (data: UpdateTenantSettingsRequest) => tenantApi.updateSettings(data),
    onSuccess: (updatedSettings, variables) => {
      queryClient.invalidateQueries({ queryKey: TENANT_KEYS.all });

      if (variables.primaryColor) {
        setPrimaryColor(variables.primaryColor);
      }

      toast.success('Workspace settings updated successfully! 🚀');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to update workspace settings.';
      toast.error(typeof msg === 'string' ? msg : 'Error updating settings.');
    },
  });
}

/**
 * Hook to upgrade workspace subscription tier.
 */
export function useUpgradeSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpgradeSubscriptionRequest) => tenantApi.upgradeSubscription(data),
    onSuccess: (updatedTenant) => {
      queryClient.invalidateQueries({ queryKey: TENANT_KEYS.all });
      toast.success(`Workspace upgraded to ${updatedTenant.tier} Tier! 🎉`);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to upgrade subscription.';
      toast.error(typeof msg === 'string' ? msg : 'Error upgrading tier.');
    },
  });
}
