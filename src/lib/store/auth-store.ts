import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  plan: "guest" | "registered" | "pro"
  status: "active" | "inactive"
  joinedAt: string
  auditCount: number
  maxAudits: number
  // Backend fields
  _id?: string
  name?: string
  role?: string
  subscription?: {
    plan: string
    status: string
  }
  usage?: {
    auditsThisMonth: number
  }
  createdAt?: string
  isActive?: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  setLoading: (loading: boolean) => void
}

export interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        // This will be handled by the useAuth hook
        throw new Error("Use useAuth hook for login")
      },

      register: async (userData: RegisterData) => {
        // This will be handled by the useAuth hook
        throw new Error("Use useAuth hook for register")
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          })
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
