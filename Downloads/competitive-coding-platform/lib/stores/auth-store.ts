"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { authApi, setAuthToken, ApiError, type AuthUser } from "@/lib/api"

interface AuthState {
  token: string | null
  user: AuthUser | null
  hydrated: boolean
  loading: boolean

  login: (identifier: string, password: string) => Promise<AuthUser>
  register: (data: {
    email: string
    password: string
    confirmPassword: string
    firstName: string
    lastName: string
    username?: string
    phone?: string
  }) => Promise<AuthUser>
  logout: () => void
  refreshProfile: () => Promise<void>
  setHydrated: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      hydrated: false,
      loading: false,

      async login(identifier, password) {
        set({ loading: true })
        try {
          const { user, token } = await authApi.login(identifier, password)
          setAuthToken(token)
          set({ token, user, loading: false })
          return user
        } catch (err) {
          set({ loading: false })
          throw err
        }
      },

      async register(data) {
        set({ loading: true })
        try {
          const { user, token } = await authApi.register(data)
          setAuthToken(token)
          set({ token, user, loading: false })
          return user
        } catch (err) {
          set({ loading: false })
          throw err
        }
      },

      logout() {
        setAuthToken(null)
        set({ token: null, user: null })
      },

      async refreshProfile() {
        if (!get().token) return
        try {
          const user = await authApi.profile()
          set({ user })
        } catch (err) {
          // Token expired or account deactivated — force logout
          if (err instanceof ApiError && err.status === 401) {
            get().logout()
          }
        }
      },

      setHydrated() {
        set({ hydrated: true })
      },
    }),
    {
      name: "shastra-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) setAuthToken(state.token)
        state?.setHydrated()
        // re-validate the session in the background
        state?.refreshProfile()
      },
    }
  )
)

export function isAdminRole(user: AuthUser | null): boolean {
  return user?.role === "ADMIN" || user?.role === "MODERATOR"
}

/** Staff = anyone with CMS access: super admins + college admins + teachers. */
export function isStaffRole(user: AuthUser | null): boolean {
  return (
    user?.role === "ADMIN" ||
    user?.role === "MODERATOR" ||
    user?.role === "COLLEGE_ADMIN" ||
    user?.role === "TEACHER"
  )
}

/** Test-case generator runs untrusted code repeatedly via Judge0 — scoped
 *  tighter than isStaffRole (no MODERATOR), matching the backend gate. */
export function canGenerateTestCases(user: AuthUser | null): boolean {
  return user?.role === "ADMIN" || user?.role === "COLLEGE_ADMIN" || user?.role === "TEACHER"
}
