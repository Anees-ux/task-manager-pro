/**
 * Multi-Tenant Theme Engine
 *
 * Applies tenant branding (primary/accent colors) and dark/light mode
 * via CSS custom properties on the document root. Called once on app boot
 * and whenever tenant settings change.
 */

const DEFAULT_PRIMARY = '#0054a6';
const DEFAULT_ACCENT = '#6366f1';

export function applyTheme(
  mode: 'dark' | 'light' = 'dark',
  primary: string = DEFAULT_PRIMARY,
  accent: string = DEFAULT_ACCENT
) {
  const root = document.documentElement;

  // Apply Bootstrap theme mode
  root.setAttribute('data-bs-theme', mode);

  // Inject tenant brand colors as CSS custom properties
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
