import React, { useState } from 'react';
import { useThemeStore } from '@stores/themeStore';
import {
  IconPalette,
  IconSparkles,
  IconCheck,
  IconRefresh,
  IconEye,
} from '@tabler/icons-react';
import toast from 'react-hot-toast';

interface BrandingFormProps {
  onSave?: (primaryColor: string) => void;
  isSaving?: boolean;
}

const PRESET_PALETTES = [
  { name: 'Linear Indigo', hex: '#4f46e5' },
  { name: 'Deep Violet', hex: '#7c3aed' },
  { name: 'Enterprise Blue', hex: '#0054a6' },
  { name: 'Emerald Green', hex: '#059669' },
  { name: 'Rose Red', hex: '#e11d48' },
  { name: 'Amber Gold', hex: '#d97706' },
  { name: 'Cyan Ocean', hex: '#0891b2' },
  { name: 'Slate Steel', hex: '#475569' },
];

export function BrandingForm({ onSave, isSaving }: BrandingFormProps) {
  const currentPrimary = useThemeStore((state) => state.primaryColor);
  const setPrimaryColor = useThemeStore((state) => state.setPrimaryColor);

  const [selectedColor, setSelectedColor] = useState(currentPrimary || '#0054a6');

  const handleColorChange = (newColor: string) => {
    setSelectedColor(newColor);
    // [WOW FACTOR]: Instant real-time CSS variable injection in DOM without layout thrashing!
    setPrimaryColor(newColor);
  };

  const handleReset = () => {
    handleColorChange('#0054a6');
    toast.success('Restored default enterprise theme.');
  };

  const handleSaveClick = () => {
    if (onSave) {
      onSave(selectedColor);
    } else {
      toast.success('Theme preferences saved locally!');
    }
  };

  return (
    <div className="card glass-surface p-4 p-md-5 shadow-sm border-0">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom border-secondary-subtle flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2.5">
          <div className="p-2 rounded-3 bg-primary-subtle text-primary border border-primary-subtle">
            <IconPalette size={20} />
          </div>
          <div>
            <h3 className="h4 fw-bold text-body mb-0">Brand Theming & Real-Time Styling</h3>
            <p className="text-secondary small mb-0">
              Changes inject live CSS tokens into the DOM for instant organizational re-branding
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="btn btn-sm btn-ghost-secondary d-flex align-items-center gap-1.5"
        >
          <IconRefresh size={15} />
          <span>Reset Default</span>
        </button>
      </div>

      {/* Content Body (Strictly <div>, NO nested <form>) */}
      <div>
        {/* Curated Palettes */}
        <div className="mb-4">
          <label className="form-label small fw-bold text-secondary mb-2">
            Curated SaaS Enterprise Palettes
          </label>
          <div className="row g-2">
            {PRESET_PALETTES.map((preset) => {
              const isSelected = selectedColor.toLowerCase() === preset.hex.toLowerCase();

              return (
                <div key={preset.hex} className="col-6 col-sm-4 col-md-3">
                  <button
                    type="button"
                    onClick={() => handleColorChange(preset.hex)}
                    className={`btn w-100 p-2 d-flex align-items-center gap-2 border rounded-3 transition-fast text-start ${
                      isSelected
                        ? 'border-primary shadow-sm bg-body-tertiary'
                        : 'border-secondary-subtle bg-body'
                    }`}
                  >
                    <span
                      className="p-2 rounded-circle border border-white-subtle shadow-sm flex-shrink-0"
                      style={{
                        backgroundColor: preset.hex,
                        width: '20px',
                        height: '20px',
                      }}
                    />
                    <span className="small fw-medium text-body text-truncate" style={{ fontSize: '0.78rem' }}>
                      {preset.name}
                    </span>
                    {isSelected && <IconCheck size={14} className="text-primary ms-auto flex-shrink-0" />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom Hex Code Picker */}
        <div className="mb-4 p-3 rounded-3 bg-body-tertiary border border-secondary-subtle">
          <label className="form-label small fw-bold text-secondary mb-2">
            Custom Brand Hex Code
          </label>
          <div className="d-flex align-items-center gap-3">
            <input
              type="color"
              className="form-control form-control-color p-1 rounded-3 border-secondary-subtle cursor-pointer"
              value={selectedColor}
              onChange={(e) => handleColorChange(e.target.value)}
              style={{ width: '48px', height: '42px' }}
              title="Choose primary brand color"
            />
            <div className="input-icon flex-fill" style={{ maxWidth: '200px' }}>
              <input
                type="text"
                className="form-control font-monospace fw-bold uppercase"
                value={selectedColor}
                onChange={(e) => handleColorChange(e.target.value)}
                placeholder="#0054A6"
              />
            </div>
            <span className="text-secondary small d-none d-md-inline" style={{ fontSize: '0.78rem' }}>
              Live CSS variable: <code>--tblr-primary</code>
            </span>
          </div>
        </div>

        {/* Live Interactive UI Preview */}
        <div className="mb-4">
          <div className="d-flex align-items-center gap-1.5 mb-2 text-secondary small fw-bold">
            <IconEye size={16} className="text-primary" />
            <span>Live Component Preview (Zero Refresh Needed)</span>
          </div>

          <div className="p-4 rounded-3 bg-body border border-secondary-subtle space-y-3">
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <button type="button" className="btn btn-primary">
                Primary Button
              </button>
              <button type="button" className="btn btn-outline-primary">
                Outline Button
              </button>
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2.5 py-1 rounded-pill small">
                Primary Badge
              </span>
              <span className="badge bg-primary text-white px-2.5 py-1 rounded-pill small">
                Solid Pill
              </span>
            </div>

            <div className="progress progress-sm" style={{ height: '6px' }}>
              <div className="progress-bar bg-primary" style={{ width: '70%', borderRadius: '9999px' }} />
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="pt-3 border-top border-secondary-subtle d-flex justify-content-end">
          <button
            type="button"
            onClick={handleSaveClick}
            className="btn btn-primary d-flex align-items-center gap-2 px-4 shadow-sm"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                <span>Saving Brand...</span>
              </>
            ) : (
              <>
                <IconSparkles size={16} />
                <span>Save Brand Theme</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
