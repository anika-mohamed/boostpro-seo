import axios from "axios"
import { useAuthStore } from "@/lib/store/auth-store"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050/api"

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor to handle auth errors safely
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const originalRequest = error.config
    const isLoginRequest = originalRequest?.url?.includes("/auth/login")

    // Only force logout and redirect for non-login protected routes
    if (status === 401 && !isLoginRequest) {
      useAuthStore.getState().logout()

      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
    }

    return Promise.reject(error)
  },
)