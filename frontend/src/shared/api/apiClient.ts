import axios from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '@shared/config/constants';

/**
 * Safely extracts the JWT token from localStorage supporting both
 * Zustand persist structure `{ state: { user: { token } } }` and legacy direct `{ token }`.
 */
export function getStoredToken(): string | null {
  const stored = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored);
    if (parsed?.state?.user?.token) return parsed.state.user.token;
    if (parsed?.token) return parsed.token;
    if (parsed?.user?.token) return parsed.user.token;
    return null;
  } catch {
    return null;
  }
}

// ─── Axios Instance ─────────────────────────────────────────────────────
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30s timeout
});

// ─── Request Interceptor: JWT Injection ──────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: 401 Auto-Logout ──────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('[apiClient] 401 Unauthorized encountered. Clearing session.');
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
      
      // Only redirect if not already on auth pages
      if (
        !window.location.pathname.startsWith('/login') &&
        !window.location.pathname.startsWith('/register')
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
