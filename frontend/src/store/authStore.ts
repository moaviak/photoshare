import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ApiError, User } from "../types/models";
import { authApi, setAuthToken } from "../utils/api";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  upgradeToCreator: () => Promise<void>;
  toggleView: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(email, password);
          if (response.success && response.data) {
            const { user, session } = response.data;
            set({
              user,
              token: session.jwt,
              isAuthenticated: true,
            });
            setAuthToken(session.jwt);
          }
        } catch (error) {
          const apiError = error as ApiError;
          set({ error: apiError.message || "Login failed" });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.register(name, email, password);
          if (response.success && response.data) {
            const { user, session } = response.data;
            set({
              user,
              token: session.jwt,
              isAuthenticated: true,
            });
            setAuthToken(session.jwt);
          }
        } catch (error) {
          const apiError = error as ApiError;
          set({ error: apiError.message || "Registration failed" });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        set({ isLoading: true, error: null });
        try {
          await authApi.logout();
          setAuthToken(null);
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        } catch (error) {
          const apiError = error as ApiError;
          set({ error: apiError.message || "Logout failed" });
        } finally {
          set({ isLoading: false });
        }
      },

      upgradeToCreator: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.upgradeToCreator();
          if (response.success && response.data) {
            set({ user: response.data });
          }
        } catch (error) {
          const apiError = error as ApiError;
          set({ error: apiError.message || "Upgrade failed" });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      toggleView: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.toggleView();
          if (response.success && response.data) {
            set({ user: response.data });
          }
        } catch (error) {
          const apiError = error as ApiError;
          set({ error: apiError.message || "Toggle view failed" });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Restore auth token on page reload
        if (state?.token) {
          setAuthToken(state.token);
        }
      },
    }
  )
);
