import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@shared/config/constants';

// ─── Types ──────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  username: string;
  email: string;
  token: string;
  tenantId?: string;
  role?: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: AuthUser) => void;
  logout: () => void;
  getToken: () => string | null;
}

// ─── Store ──────────────────────────────────────────────────────────────
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: true,
        }),

      logout: () => {
        set({ user: null, isAuthenticated: false });
        // Clear any other stored data on logout
        localStorage.removeItem(STORAGE_KEYS.THEME);
      },

      getToken: () => get().user?.token ?? null,
    }),
    {
      name: STORAGE_KEYS.AUTH_USER,
    }
  )
);
