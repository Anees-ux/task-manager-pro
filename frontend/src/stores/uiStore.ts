import { create } from 'zustand';

// ─── Types ──────────────────────────────────────────────────────────────
interface UIState {
  /** Whether the sidebar is collapsed */
  sidebarCollapsed: boolean;
  /** Whether the AI assistant drawer is open */
  aiDrawerOpen: boolean;
  /** Currently active sidebar navigation item */
  activeNavItem: string;

  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleAiDrawer: () => void;
  setAiDrawerOpen: (open: boolean) => void;
  setActiveNavItem: (item: string) => void;
}

// ─── Store ──────────────────────────────────────────────────────────────
export const useUIStore = create<UIState>()((set) => ({
  sidebarCollapsed: false,
  aiDrawerOpen: false,
  activeNavItem: 'dashboard',

  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  toggleAiDrawer: () => set((s) => ({ aiDrawerOpen: !s.aiDrawerOpen })),
  setAiDrawerOpen: (open) => set({ aiDrawerOpen: open }),

  setActiveNavItem: (item) => set({ activeNavItem: item }),
}));
