"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

type User = {
  _id: string
  name: string
  email: string
  role: string
  isActive: boolean
  emailVerified: boolean
  createdAt: string
}

type UpdateUserPayload = Partial<Pick<User, "name" | "email" | "role" | "isActive" | "emailVerified">>

export const useAdminUsers = () => {
  const queryClient = useQueryClient()

  const getUsers = useQuery<User[]>({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users")
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || "Failed to fetch users")
      return json.data
    },
  })

  const updateUser = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateUserPayload }) => {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || "Failed to update user")
      return json.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-users"])
    },
  })

  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || "Failed to delete user")
      return json
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-users"])
    },
  })

  return { getUsers, updateUser, deleteUser }
}
