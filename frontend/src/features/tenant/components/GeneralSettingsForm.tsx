import React from 'react';
import { useFormContext } from 'react-hook-form';
import { OverAllocationPolicy } from '@shared/types/enums';
import {
  IconSettings,
  IconClock,
  IconWorld,
  IconShield,
} from '@tabler/icons-react';

const IANA_TIMEZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'America/New York (Eastern Time - EST/EDT)' },
  { value: 'America/Chicago', label: 'America/Chicago (Central Time - CST/CDT)' },
  { value: 'America/Los_Angeles', label: 'America/Los Angeles (Pacific Time - PST/PDT)' },
  { value: 'Europe/London', label: 'Europe/London (GMT/BST)' },
  { value: 'Europe/Berlin', label: 'Europe/Berlin (CET/CEST)' },
  { value: 'Asia/Karachi', label: 'Asia/Karachi (PKT UTC+5)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST UTC+4)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT UTC+8)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST UTC+9)' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney (AEST/AEDT)' },
];

export function GeneralSettingsForm() {
  const { register } = useFormContext();

  return (
    <div className="card glass-surface p-4 p-md-5 shadow-sm border-0">
      <div className="d-flex align-items-center gap-2.5 mb-4 pb-3 border-bottom border-secondary-subtle">
        <div className="p-2 rounded-3 bg-primary-subtle text-primary border border-primary-subtle">
          <IconSettings size={20} />
        </div>
        <div>
          <h3 className="h4 fw-bold text-body mb-0">General Workspace Configuration</h3>
          <p className="text-secondary small mb-0">
            Configure default working hours, IANA timezone standardization, and capacity limits
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Timezone */}
        <div className="mb-3">
          <label className="form-label small fw-bold text-secondary">
            Default Workspace Timezone (IANA)
          </label>
          <div className="input-icon">
            <span className="input-icon-addon">
              <IconWorld size={17} />
            </span>
            <select className="form-select" {...register('timezone')}>
              {IANA_TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>
          <div className="text-muted small mt-1" style={{ fontSize: '0.72rem' }}>
            All task deadlines and roster timelines will synchronize against this primary timezone.
          </div>
        </div>

        {/* Work Hours & Over-Allocation Policy */}
        <div className="row g-3">
          <div className="col-sm-6">
            <label className="form-label small fw-bold text-secondary">
              Standard Daily Working Hours
            </label>
            <div className="input-icon">
              <span className="input-icon-addon">
                <IconClock size={17} />
              </span>
              <input
                type="number"
                step="0.5"
                min="1"
                max="24"
                className="form-control"
                placeholder="8"
                {...register('defaultWorkHoursPerDay')}
              />
            </div>
            <div className="text-muted small mt-1" style={{ fontSize: '0.72rem' }}>
              Base capacity calculation for 100% engineer load.
            </div>
          </div>

          <div className="col-sm-6">
            <label className="form-label small fw-bold text-secondary">
              Over-Allocation Policy
            </label>
            <div className="input-icon">
              <span className="input-icon-addon">
                <IconShield size={17} />
              </span>
              <select className="form-select" {...register('overAllocationPolicy')}>
                <option value={OverAllocationPolicy.Warn}>Warn (Allow assignment with visual alert)</option>
                <option value={OverAllocationPolicy.Block}>Block (Strictly forbid assignment if &gt; 100%)</option>
                <option value={OverAllocationPolicy.Allow}>Allow (Unrestricted assignment)</option>
              </select>
            </div>
            <div className="text-muted small mt-1" style={{ fontSize: '0.72rem' }}>
              Defines guardrails when assigning tasks to team members nearing capacity limits.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
