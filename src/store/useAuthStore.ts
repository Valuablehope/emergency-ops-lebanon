import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = 
  | "super_admin" 
  | "national_im" 
  | "base_manager" 
  | "program_manager" 
  | "data_entry" 
  | "field_enumerator" 
  | "viewer";

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  areaId?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: "emergency-ops-auth",
    }
  )
);
