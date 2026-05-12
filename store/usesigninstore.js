import { create } from "zustand";

export const useSiginStore = create((set) => ({
  signin: {
    email: "",
    password: "",
  },

  updatesignin: (data) =>
    set((state) => ({
      signin: { ...state.signin, ...data },
    })),
}));