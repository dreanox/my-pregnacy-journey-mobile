import { create } from 'zustand';

interface AppState {
  // Add global state slices here as needed
}

export const useAppStore = create<AppState>(() => ({
  // Initial state
}));
