"use client"

import { useState, useEffect } from "react"
import axios from "axios"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, BarChart3, DollarSign, Activity, Search, MoreHorizontal, UserPlus, Settings } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [openDialog, setOpenDialog] = useState(false)
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "" })
  const [stats, setStats] = useState({ totalUsers: 0, activeUsers: 0, totalRevenue: 0, auditsThisMonth: 0 })
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [resetUser, setResetUser] = useState(null)
  const [newPassword, setNewPassword] = useState("")
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token")
        const [statsRes, usersRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats/dashboard`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
        ])

        setStats(statsRes.data.data)
        const mappedUsers = usersRes.data.data.map(user => ({
          ...user,
          plan: (user.subscription?.plan || "free").toLowerCase(), // Normalize to lowercase
          status: user.isActive ? "active" : "inactive",
        }))
        setUsers(mappedUsers)
      } catch (err) {
        toast.error("Failed to fetch dashboard data", { description: err?.response?.data?.message || "Check your server/API" })
      }
    }

    fetchDashboardData()
  }, [])

  const handleCreateUser = async () => {
    try {
      const token = localStorage.getItem("token")
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/admin/users`, newUser, { headers: { Authorization: `Bearer ${token}` } })
      toast.success("User created successfully")
      setOpenDialog(false)
      setNewUser({ name: "", email: "", password: "" })
      const usersRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/users`, { headers: { Authorization: `Bearer ${token}` } })
      setUsers(usersRes.data.data)
    } catch (err) {
      toast.error("Error creating user", { description: err?.response?.data?.message || "Something went wrong" })
    }
  }

  const handleUpdateUser = async () => {
    try {
      const token = localStorage.getItem("token")
      const payload = {
        name: editUser.name,
        email: editUser.email,
        role: editUser.role,
        isActive: editUser.status === "active",
        plan: editUser.plan?.toLowerCase() || "free",
      }
      const res = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${editUser._id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success("User updated successfully")
      setIsEditDialogOpen(false)
      const updatedUser = res.data.data
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === updatedUser._id
            ? { ...user, ...updatedUser, status: updatedUser.isActive ? "active" : "inactive", plan: updatedUser.subscription?.plan || user.plan || "Free" }
            : user
        )
      )
    } catch (err) {
      toast.error("Failed to update user", { description: err?.response?.data?.message || "Something went wrong" })
    }
  }

  const handleResetPassword = async () => {
    try {
      const token = localStorage.getItem("token")
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${resetUser._id}`, { password: newPassword }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success("Password reset successfully")
      setIsResetDialogOpen(false)
      setNewPassword("")
    } catch (err) {
      toast.error("Failed to reset password", { description: err?.response?.data?.message || "Something went wrong" })
    }
  }

  const handleDeactivateUser = async (userId) => {
    try {
      const token = localStorage.getItem("token")
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}`, { isActive: false }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success("User deactivated successfully")
      const usersRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/users`, { headers: { Authorization: `Bearer ${token}` } })
      setUsers(usersRes.data.data)
    } catch (err) {
      toast.error("Failed to deactivate user", { description: err?.response?.data?.message || "Something went wrong" })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-gray-600">Manage users, content, and system settings</p>
            </div>
          </div>

          {/* Add User Dialog */}
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateUser}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6">
        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeUsers?.toLocaleString() || "0"}</div>
              <p className="text-xs text-muted-foreground">+8% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue?.toLocaleString() || "0"}</div>
              <p className="text-xs text-muted-foreground">+23% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Audits This Month</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.auditsThisMonth?.toLocaleString() || "0"}</div>
              <p className="text-xs text-muted-foreground">+15% from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">System Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage user accounts and permissions</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 w-64"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(users || [])
                      .filter((user) =>
                        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        user.email.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((user) => (
                        <TableRow key={user._id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                         
  <Badge
    variant={
      user.plan === "Pro"
        ? "default"
        : user.plan === "Registered"
        ? "secondary"
        : user.plan === "Admin"
        ? "destructive"
        : "outline" // fallback for "Free" or unknown
    }
  >
    {user.plan || "Free"}
  </Badge>

                          </TableCell>
                          <TableCell>
                          <Badge variant={user.status === "active" ? "default" : "secondary"}>
  {user.status || "unknown"}
</Badge>
                          </TableCell>
                          <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedUser(user)
                                    setIsViewDialogOpen(true)
                                  }}
                                >
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditUser(user)
                                    setIsEditDialogOpen(true)
                                  }}
                                >
                                  Edit User
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setResetUser(user)
                                    setIsResetDialogOpen(true)
                                  }}
                                >
                                  Reset Password
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleDeactivateUser(user._id)}
                                >
                                  Deactivate
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics & Settings tab contents can be added here */}
        </Tabs>
      </div>

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p><strong>Name:</strong> {selectedUser?.name}</p>
            <p><strong>Email:</strong> {selectedUser?.email}</p>
            <p><strong>Password:</strong> {selectedUser?.password || "******"}</p>
            <p><strong>Role:</strong> {selectedUser?.role}</p>
            <p><strong>Email Verified:</strong> {selectedUser?.emailVerified ? "Yes" : "No"}</p>
            <p><strong>Company:</strong> {selectedUser?.profile?.company || "-"}</p>
            <p><strong>Website:</strong> {selectedUser?.profile?.website || "-"}</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit User</DialogTitle>
    </DialogHeader>
    <div className="space-y-4">
      <Label>Name</Label>
      <Input
        value={editUser?.name || ""}
        onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
      />
      <Label>Email</Label>
      <Input
        type="email"
        value={editUser?.email || ""}
        onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
      />
      <Label>Role</Label>
      <Input
        value={editUser?.role || ""}
        onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
        placeholder="e.g., registered, admin"
      />
      <Label>Status</Label>
<select
  value={editUser?.status || "active"}
  onChange={(e) => setEditUser({ ...editUser, status: e.target.value })}
  className="w-full border rounded px-3 py-2"
>
  <option value="active">Active</option>
  <option value="inactive">Inactive</option>
</select>

    </div>
    <DialogFooter>
      <Button onClick={handleUpdateUser}>Update</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>


      {/* Reset Password Dialog */}
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
          </DialogHeader>
          <Input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoFocus
          />
          <DialogFooter>
            <Button onClick={handleResetPassword}>Reset</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
