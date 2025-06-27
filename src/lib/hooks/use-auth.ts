"use client"

import { useAuthStore } from "@/lib/store/auth-store"
import { authApi } from "@/lib/api/auth"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import axios from "axios"


export const useAuth = () => {
  const router = useRouter()
  const { user, token, isAuthenticated, isLoading, logout: logoutStore, updateUser, setLoading } = useAuthStore()

  const transformBackendUser = (backendUser: any) => {
    return {
      id: backendUser.id || backendUser._id,
      firstName: backendUser.name?.split(" ")[0] || "",
      lastName: backendUser.name?.split(" ").slice(1).join(" ") || "",
      email: backendUser.email,
      plan:
        backendUser.subscription?.plan === "basic"
          ? "registered"
          : backendUser.subscription?.plan === "pro"
            ? "pro"
            : "guest",
      status: backendUser.isActive ? "active" : "inactive",
      joinedAt: backendUser.createdAt || new Date().toISOString(),
      auditCount: backendUser.usage?.auditsThisMonth || 0,
      maxAudits: backendUser.subscription?.plan === "pro" ? 999 : backendUser.subscription?.plan === "basic" ? 50 : 10,
      _id: backendUser._id,
      name: backendUser.name,
      role: backendUser.role,
      subscription: backendUser.subscription,
      usage: backendUser.usage,
      createdAt: backendUser.createdAt,
      isActive: backendUser.isActive,
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      const response = await authApi.login(email, password)

      const transformedUser = transformBackendUser(response.data)

      useAuthStore.setState({
        user: transformedUser,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      })

      toast.success("Login successful!")
      router.push("/dashboard")
    } catch (error: any) {
      setLoading(false)
      toast.error(error.response?.data?.message || "Login failed")
      throw error
    }
  }

  const register = async (userData: {
    firstName: string
    lastName: string
    email: string
    password: string
  }) => {
    try {
      setLoading(true)

      const backendData = {
        name: `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
        password: userData.password,
      }

      const response = await authApi.register(backendData)

      const transformedUser = transformBackendUser({
        ...response.data,
        name: backendData.name,
      })

      useAuthStore.setState({
        user: transformedUser,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      })

      toast.success("Registration successful!")
      router.push("/dashboard")
    } catch (error: any) {
      setLoading(false)
      toast.error(error.response?.data?.message || "Registration failed")
      throw error
    }
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      logoutStore()
      toast.success("Logged out successfully")
      router.push("/")
    }
  }

  const forgotPassword = async (email: string) => {
    try {
      setLoading(true)
      await authApi.forgotPassword(email)
      toast.success("Password reset email sent!")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send reset email")
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updatedData: { name: string; email: string; password?: string }) => {
    try {
      setLoading(true)

      const response = await authApi.updateProfile(updatedData)

      const updatedUser = transformBackendUser(response.data)

      useAuthStore.setState({ user: updatedUser, isLoading: false })

      toast.success("Profile updated successfully!")
    } catch (error: any) {
      setLoading(false)
      toast.error(error.response?.data?.message || "Failed to update profile")
      throw error
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    forgotPassword,
    updateProfile, // ✅ 
    updateUser,
  }
}
