// store/useAuth.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuth = create(
  persist(
    (set) => ({
      user: null,
      status: "idle", // idle, checking, authenticated, unauthenticated
      token: null,
      
      setAuthUser: (userData) => {
        set({ 
          user: userData, 
          status: "authenticated",
          token: userData?.token || localStorage.getItem("zenosms_token")
        });
      },
      
      setStatus: (status) => set({ status }),
      
      clearAuth: () => {
        localStorage.removeItem("zenosms_token");
        localStorage.removeItem("zenosms_user");
        set({ user: null, status: "unauthenticated", token: null });
      },
      
      updateUser: (updates) => set((state) => ({
        user: { ...state.user, ...updates }
      })),
    }),
    {
      name: "zenosms-auth",
      getStorage: () => localStorage,
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

export default useAuth;