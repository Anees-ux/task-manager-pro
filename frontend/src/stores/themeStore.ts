import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@shared/config/constants';

// ─── Types ──────────────────────────────────────────────────────────────
interface ThemeState {
  /** Dark or light mode */
  mode: 'dark' | 'light';
  /** Tenant primary brand color */
  primaryColor: string;
  /** Tenant accent color */
  accentColor: string;
  /** Tenant logo URL */
  logoUrl: string | null;

  // Actions
  toggleMode: () => void;
  setMode: (mode: 'dark' | 'light') => void;
  setPrimaryColor: (color: string) => void;
  setAccentColor: (color: string) => void;
  setLogoUrl: (url: string | null) => void;
  applyTenantBranding: (primary: string, accent: string, logo?: string | null) => void;
}

/** Default Tabler primary color */
const DEFAULT_PRIMARY = '#0054a6';
const DEFAULT_ACCENT = '#6366f1';

// ─── CSS Variable Injection Helper ──────────────────────────────────────
function injectCssVariables(primary: string, accent: string) {
  const root = document.documentElement;
  root.style.setProperty('--tblr-primary', primary);
  root.style.setProperty('--tblr-primary-rgb', hexToRgb(primary));
  root.style.setProperty('--tblr-accent', accent);
  root.style.setProperty('--tblr-accent-rgb', hexToRgb(accent));
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0, 84, 166';
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}

// ─── Store ──────────────────────────────────────────────────────────────
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'dark',
      primaryColor: DEFAULT_PRIMARY,
      accentColor: DEFAULT_ACCENT,
      logoUrl: null,

      toggleMode: () =>
        set((state) => {
          const newMode = state.mode === 'dark' ? 'light' : 'dark';
          document.documentElement.setAttribute('data-bs-theme', newMode);
          return { mode: newMode };
        }),

      setMode: (mode) => {
        document.documentElement.setAttribute('data-bs-theme', mode);
        set({ mode });
      },

      setPrimaryColor: (color) => {
        injectCssVariables(color, DEFAULT_ACCENT);
        set({ primaryColor: color });
      },

      setAccentColor: (color) => {
        set((state) => {
          injectCssVariables(state.primaryColor, color);
          return { accentColor: color };
        });
      },

      setLogoUrl: (url) => set({ logoUrl: url }),

      applyTenantBranding: (primary, accent, logo) => {
        injectCssVariables(primary, accent);
        document.documentElement.setAttribute(
          'data-bs-theme',
          localStorage.getItem(STORAGE_KEYS.THEME) ? 'dark' : 'dark'
        );
        set({
          primaryColor: primary,
          accentColor: accent,
          logoUrl: logo ?? null,
        });
      },
    }),
    {
      name: STORAGE_KEYS.THEME,
      onRehydrateStorage: () => (state) => {
        // Re-apply CSS variables and dark mode on page load
        if (state) {
          injectCssVariables(state.primaryColor, state.accentColor);
          document.documentElement.setAttribute('data-bs-theme', state.mode);
        }
      },
    }
  )
);
