/**
 * @ai-context Global sidebar collapse state using Zustand.
 * Persists to localStorage so the user's preference is remembered.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SidebarState {
  collapsed: boolean;
  mobileOpen: boolean;
  toggle: () => void;
  setCollapsed: (value: boolean) => void;
  setMobileOpen: (value: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      collapsed: false,
      mobileOpen: false,
      toggle: () => set((s) => ({ collapsed: !s.collapsed })),
      setCollapsed: (value) => set({ collapsed: value }),
      setMobileOpen: (value) => set({ mobileOpen: value }),
    }),
    {
      name: "solom-sidebar",
      partialize: (state) => ({ collapsed: state.collapsed }),
    }
  )
);
