import { apiClient } from "./client"
import type { RegisterData } from "@/lib/store/auth-store"

export interface LoginResponse {
  success: boolean
  message: string
  token: string
  data: {
    id: string
    name: string
    email: string
    role: string
    subscription: {
      status: string
      plan: string
    }
    emailVerified: boolean
  }
}

export interface RegisterResponse {
  success: boolean
  message: string
  token: string
  data: {
    id: string
    name: string
    email: string
    role: string
    subscription: {
      status: string
      plan: string
    }
    emailVerified: boolean
  }
}

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post("/auth/login", { email, password })
    return response.data
  },

  register: async (userData: RegisterData): Promise<RegisterResponse> => {
    const response = await apiClient.post("/auth/register", userData)
    return response.data
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.get("/auth/logout")
    } catch (error) {
      console.warn("Logout API call failed:", error)
    }
  },

  refreshToken: async (): Promise<{ token: string }> => {
    const response = await apiClient.post("/auth/refresh")
    return response.data
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post("/auth/forgotpassword", { email })
    return response.data
  },

  resetPassword: async (token: string, password: string): Promise<{ message: string }> => {
    const response = await apiClient.put(`/auth/resetpassword/${token}`, { password })
    return response.data
  },

  updateProfile: async (data: { name: string; email: string; password?: string }) => {
    return await axios.put("/api/profile", data)
  },
}