import { create } from "zustand";

export const useSignupStore = create((set) => ({
  formData: {
    email: "",
    password: "",
    confirm: "",
    name: "",
    handle: "",
    bio: "",
    role: "",
    lookingFor: "Collaborator",
    skillsHave: [],
    skillsNeed: [],
  },

  updateForm: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),

  resetForm: () =>
    set(() => ({
      formData: {
        email: "",
        password: "",
        confirm: "",
        name: "",
        handle: "",
        bio: "",
        role: "",
        lookingFor: "Collaborator",
        skillsHave: [],
        skillsNeed: [],
      },
    })),
}));
