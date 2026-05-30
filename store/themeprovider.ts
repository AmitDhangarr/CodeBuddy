import { create } from "zustand";
import { persist } from "zustand/middleware";

type ThemeStore = {
  dark: boolean;
  toggleDark: () => void;
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      dark: true,
      toggleDark: () => set({ dark: !get().dark }),
    }),
    {
      name: "codebuddy-theme",
    }
  )
);