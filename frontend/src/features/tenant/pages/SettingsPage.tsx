import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useTenant, useUpdateTenantSettings } from '../hooks/useTenant';
import { useThemeStore } from '@stores/themeStore';
import { PageHeader } from '@shared/ui/PageHeader';
import { LoadingSpinner } from '@shared/ui/LoadingSpinner';
import { SettingsSidebar } from '../components/SettingsSidebar';
import { GeneralSettingsForm } from '../components/GeneralSettingsForm';
import { BrandingForm } from '../components/BrandingForm';
import { AiEngineSettings } from '../components/AiEngineSettings';
import { SecurityPlanTab } from '../components/SecurityPlanTab';
import type { SettingsTabId, UpdateTenantSettingsRequest } from '../types/tenant.types';
import { OverAllocationPolicy, AiApprovalMode } from '@shared/types/enums';
import { IconDeviceFloppy } from '@tabler/icons-react';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTabId>('general');
  const { data: tenant, isLoading } = useTenant();
  const updateSettingsMutation = useUpdateTenantSettings();
  const primaryColor = useThemeStore((state) => state.primaryColor);

  const methods = useForm<UpdateTenantSettingsRequest>({
    defaultValues: {
      timezone: 'UTC',
      defaultWorkHoursPerDay: 8,
      overAllocationPolicy: OverAllocationPolicy.Warn,
      aiAutoAssignEnabled: true,
      aiApprovalMode: AiApprovalMode.RequireApproval,
      aiConfidenceThreshold: 0.85,
      primaryColor: primaryColor ?? '#0054a6',
    },
  });

  const { reset, handleSubmit } = methods;

  useEffect(() => {
    if (tenant?.settings) {
      reset({
        timezone: tenant.settings.timezone ?? 'UTC',
        defaultWorkHoursPerDay: tenant.settings.defaultWorkHoursPerDay ?? 8,
        overAllocationPolicy: tenant.settings.overAllocationPolicy ?? OverAllocationPolicy.Warn,
        aiAutoAssignEnabled: tenant.settings.aiAutoAssignEnabled ?? true,
        aiApprovalMode: tenant.settings.aiApprovalMode ?? AiApprovalMode.RequireApproval,
        aiConfidenceThreshold: tenant.settings.aiConfidenceThreshold ?? 0.85,
        primaryColor: primaryColor ?? '#0054a6',
      });
    }
  }, [tenant, reset, primaryColor]);

  const onSubmit = async (data: UpdateTenantSettingsRequest) => {
    await updateSettingsMutation.mutateAsync({
      ...data,
      primaryColor: useThemeStore.getState().primaryColor,
    });
  };

  if (isLoading && !tenant) {
    return (
      <div className="card glass-surface p-5 text-center my-4">
        <LoadingSpinner size="md" message="Synchronizing organizational control plane settings..." />
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Page Header */}
        <PageHeader
          title="Tenant Settings Control Plane"
          subtitle="Configure multi-tenant brand theming, IANA timezones, over-allocation guardrails, and subscription tier"
          actions={
            <div className="d-flex align-items-center gap-2">
              <button
                type="submit"
                className="btn btn-primary d-flex align-items-center gap-2 shadow-sm"
                disabled={updateSettingsMutation.isPending}
              >
                {updateSettingsMutation.isPending ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <IconDeviceFloppy size={16} />
                    <span>Save All Changes</span>
                  </>
                )}
              </button>
            </div>
          }
        />

        {/* Vertical Tab Layout (Stripe/AWS-caliber Grid) */}
        <div className="row g-4 pt-1">
          {/* Left Vertical Navigation Menu */}
          <div className="col-12 col-lg-3">
            <div className="card glass-surface p-2 shadow-sm border-0 sticky-top" style={{ top: '80px' }}>
              <div className="p-3 pb-2 border-bottom border-secondary-subtle">
                <div className="fw-bold text-body small text-uppercase" style={{ letterSpacing: '0.06em', fontSize: '0.68rem' }}>
                  Workspace Navigation
                </div>
                <div className="text-secondary small font-monospace mt-0.5" style={{ fontSize: '0.72rem' }}>
                  {tenant?.name ?? 'Acme Global Corp'}
                </div>
              </div>
              <div className="p-1 pt-2">
                <SettingsSidebar activeTab={activeTab} onSelectTab={setActiveTab} />
              </div>
            </div>
          </div>

          {/* Right Active Tab Content */}
          <div className="col-12 col-lg-9">
            {activeTab === 'general' && <GeneralSettingsForm />}
            {activeTab === 'branding' && (
              <BrandingForm
                onSave={(color) => {
                  handleSubmit((data) =>
                    updateSettingsMutation.mutate({ ...data, primaryColor: color })
                  )();
                }}
                isSaving={updateSettingsMutation.isPending}
              />
            )}
            {activeTab === 'ai-engine' && <AiEngineSettings />}
            {activeTab === 'security' && <SecurityPlanTab tenant={tenant} />}
          </div>
        </div>
      </form>
    </FormProvider>
  );
}

export default SettingsPage;
