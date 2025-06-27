"use client"

import type React from "react"
import { useAuth } from "@/lib/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPlan?: "guest" | "free" | "basic" | "pro"
  adminOnly?: boolean
}

const planHierarchy = {
  guest: 0,
  free: 1,
  basic: 2,
  pro: 3,
  admin: 4,
}

export function ProtectedRoute({ children, requiredPlan = "guest", adminOnly = false }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login")
        return
      }

      if (adminOnly && user?.role !== "admin") {
        router.push("/dashboard")
        return
      }

      const userPlan = user?.subscription?.plan || "guest"
      const userPlanLevel = planHierarchy[userPlan as keyof typeof planHierarchy] || 0
      const requiredPlanLevel = planHierarchy[requiredPlan]

      if (user?.role !== "admin" && userPlanLevel < requiredPlanLevel) {
        router.push("/upgrade")
        return
      }
    }
  }, [isAuthenticated, user, isLoading, router, requiredPlan, adminOnly])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
