// ─── Application Constants ──────────────────────────────────────────────

/** Base API URL — proxied through Vite in dev, direct in production */
export const API_BASE_URL = '/api';

/** Azure production URL (commented out for local dev) */
// export const API_BASE_URL = 'https://taskmanager-api-fechabb7bafmdxck.centralus-01.azurewebsites.net/api';

/** SignalR Hub URL */
export const SIGNALR_HUB_URL = '/hubs/taskboard';

/** LocalStorage keys */
export const STORAGE_KEYS = {
  AUTH_USER: 'taskmanager_auth',
  THEME: 'taskmanager_theme',
  SIDEBAR_COLLAPSED: 'taskmanager_sidebar',
} as const;

/** TanStack Query — stale times */
export const QUERY_STALE_TIMES = {
  /** Data that rarely changes (tenant settings, user profiles) */
  STATIC: 5 * 60 * 1000, // 5 minutes
  /** Data that changes moderately (projects, team list) */
  MODERATE: 2 * 60 * 1000, // 2 minutes
  /** Data that changes frequently (tasks, capacity snapshots) */
  DYNAMIC: 30 * 1000, // 30 seconds
} as const;

/** Default pagination */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;
