/**
 * @ai-context Global command palette open state using Zustand.
 */
import { create } from "zustand";

interface CommandState {
  open: boolean;
  setOpen: (value: boolean) => void;
  toggle: () => void;
}

export const useCommandStore = create<CommandState>()((set) => ({
  open: false,
  setOpen: (value) => set({ open: value }),
  toggle: () => set((s) => ({ open: !s.open })),
}));
