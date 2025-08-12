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

function ContentManagement() {
  const [content, setContent] = useState({
    hero: {
      badge: "AI-Powered SEO Platform",
      title: "Boost Your Website's SEO Performance",
      description:
        "Empower your small business with AI-driven SEO tools. Get automated audits, keyword research, competitor analysis, and actionable insights without technical expertise.",
      primaryButton: "Start Free Trial",
      secondaryButton: "View Demo",
    },
    features: {
      title: "Powerful SEO Features",
      description: "Everything you need to improve your website's search engine visibility",
      items: [
        {
          icon: "Search",
          title: "Automated SEO Audits",
          description:
            "Get comprehensive website audits using Google PageSpeed Insights. Analyze performance, mobile-friendliness, and technical SEO issues automatically.",
        },
        {
          icon: "BarChart3",
          title: "AI-Powered SWOT Analysis",
          description:
            "Receive intelligent analysis of your SEO strengths, weaknesses, opportunities, and threats with actionable recommendations powered by AI.",
        },
        {
          icon: "TrendingUp",
          title: "Keyword Research & Trends",
          description:
            "Discover high-potential keywords with Google Trends integration. Get search volume, competition data, and trend analysis to optimize your content strategy.",
        },
        {
          icon: "Users",
          title: "Competitor Analysis",
          description:
            "Compare your SEO metrics with top-ranking competitors. Identify gaps, opportunities, and strategies to outrank your competition in search results.",
        },
        {
          icon: "Globe",
          title: "Progress Tracking & Reports",
          description:
            "Track your SEO progress over time with visual charts and generate comprehensive PDF reports. Get ranking predictions and measure campaign effectiveness.",
        },
        {
          icon: "Zap",
          title: "Content Optimization",
          description:
            "Transform your content with SEO-optimized keywords and AI-powered suggestions. Improve readability and search visibility automatically.",
        },
      ],
    },
    pricing: {
      title: "Simple, Transparent Pricing",
      description: "Choose the plan that fits your business needs",
      plans: [
        {
          name: "Guest User",
          price: "Free",
          description: "Perfect for trying out our platform",
          features: ["Limited SEO audit (summary only)", "Create business profile", "View landing page"],
          buttonText: "Get Started",
          buttonVariant: "outline",
          popular: false,
        },
        {
          name: "Registered User",
          price: "$19",
          period: "/month",
          description: "Great for small businesses getting started",
          features: [
            "Limited SEO audits",
            "Keyword suggestion summary",
            "Save audit history",
            "Limited competitor info",
          ],
          buttonText: "Start Free Trial",
          buttonVariant: "default",
          popular: true,
        },
        {
          name: "Pro User",
          price: "$49",
          period: "/month",
          description: "Full access for growing businesses",
          features: [
            "Full SEO audits & SWOT reports",
            "Download PDF reports",
            "Complete competitor analysis",
            "Rank prediction",
            "Image alt suggestions",
          ],
          buttonText: "Upgrade to Pro",
          buttonVariant: "default",
          popular: false,
        },
      ],
    },
    cta: {
      title: "Ready to Boost Your SEO?",
      description: "Join thousands of small businesses already improving their online visibility with SEO BoostPro.",
      primaryButton: "Start Your Free Trial",
      secondaryButton: "Contact Sales",
    },
  })

  const [activeSection, setActiveSection] = useState("hero")

  useEffect(() => {
    // Load content from localStorage if available
    const savedContent = localStorage.getItem("landingPageContent")
    if (savedContent) {
      try {
        setContent(JSON.parse(savedContent))
      } catch (error) {
        console.error("Error loading saved content:", error)
      }
    }
  }, [])

  const handleSave = () => {
    try {
      localStorage.setItem("landingPageContent", JSON.stringify(content))
      toast.success("Content saved successfully!")
    } catch (error) {
      toast.error("Failed to save content")
    }
  }

  const updateHero = (field: string, value: string) => {
    setContent((prev) => ({
      ...prev,
      hero: { ...prev.hero, [field]: value },
    }))
  }

  const updateFeatures = (field: string, value: string) => {
    setContent((prev) => ({
      ...prev,
      features: { ...prev.features, [field]: value },
    }))
  }

  const updateFeatureItem = (index: number, field: string, value: string) => {
    setContent((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        items: prev.features.items.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
      },
    }))
  }

  const updatePricing = (field: string, value: string) => {
    setContent((prev) => ({
      ...prev,
      pricing: { ...prev.pricing, [field]: value },
    }))
  }

  const updatePricingPlan = (planIndex: number, field: string, value: any) => {
    setContent((prev) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        plans: prev.pricing.plans.map((plan, i) => (i === planIndex ? { ...plan, [field]: value } : plan)),
      },
    }))
  }

  const updatePlanFeature = (planIndex: number, featureIndex: number, value: string) => {
    setContent((prev) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        plans: prev.pricing.plans.map((plan, i) =>
          i === planIndex
            ? {
                ...plan,
                features: plan.features.map((feature, j) => (j === featureIndex ? value : feature)),
              }
            : plan,
        ),
      },
    }))
  }

  const updateCTA = (field: string, value: string) => {
    setContent((prev) => ({
      ...prev,
      cta: { ...prev.cta, [field]: value },
    }))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Landing Page Content Management</CardTitle>
              <CardDescription>Edit the content displayed on your landing page</CardDescription>
            </div>
            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
              Save Changes
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeSection} onValueChange={setActiveSection}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="hero">Hero Section</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="cta">Call to Action</TabsTrigger>
            </TabsList>

            <TabsContent value="hero" className="space-y-4 mt-6">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="hero-badge">Badge Text</Label>
                  <Input
                    id="hero-badge"
                    value={content.hero.badge}
                    onChange={(e) => updateHero("badge", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="hero-title">Main Title</Label>
                  <Input
                    id="hero-title"
                    value={content.hero.title}
                    onChange={(e) => updateHero("title", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="hero-description">Description</Label>
                  <textarea
                    id="hero-description"
                    className="w-full min-h-[100px] p-3 border rounded-md"
                    value={content.hero.description}
                    onChange={(e) => updateHero("description", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hero-primary-btn">Primary Button Text</Label>
                    <Input
                      id="hero-primary-btn"
                      value={content.hero.primaryButton}
                      onChange={(e) => updateHero("primaryButton", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="hero-secondary-btn">Secondary Button Text</Label>
                    <Input
                      id="hero-secondary-btn"
                      value={content.hero.secondaryButton}
                      onChange={(e) => updateHero("secondaryButton", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="features" className="space-y-4 mt-6">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="features-title">Features Section Title</Label>
                  <Input
                    id="features-title"
                    value={content.features.title}
                    onChange={(e) => updateFeatures("title", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="features-description">Features Description</Label>
                  <textarea
                    id="features-description"
                    className="w-full min-h-[80px] p-3 border rounded-md"
                    value={content.features.description}
                    onChange={(e) => updateFeatures("description", e.target.value)}
                  />
                </div>

                <div className="space-y-6">
                  <h4 className="font-semibold">Feature Items</h4>
                  {content.features.items.map((item, index) => (
                    <Card key={index} className="p-4">
                      <div className="grid gap-3">
                        <div>
                          <Label>Feature {index + 1} Title</Label>
                          <Input
                            value={item.title}
                            onChange={(e) => updateFeatureItem(index, "title", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Feature {index + 1} Description</Label>
                          <textarea
                            className="w-full min-h-[80px] p-3 border rounded-md"
                            value={item.description}
                            onChange={(e) => updateFeatureItem(index, "description", e.target.value)}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-4 mt-6">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="pricing-title">Pricing Section Title</Label>
                  <Input
                    id="pricing-title"
                    value={content.pricing.title}
                    onChange={(e) => updatePricing("title", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="pricing-description">Pricing Description</Label>
                  <textarea
                    id="pricing-description"
                    className="w-full min-h-[80px] p-3 border rounded-md"
                    value={content.pricing.description}
                    onChange={(e) => updatePricing("description", e.target.value)}
                  />
                </div>

                <div className="space-y-6">
                  <h4 className="font-semibold">Pricing Plans</h4>
                  {content.pricing.plans.map((plan, planIndex) => (
                    <Card key={planIndex} className="p-4">
                      <div className="grid gap-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Plan Name</Label>
                            <Input
                              value={plan.name}
                              onChange={(e) => updatePricingPlan(planIndex, "name", e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Price</Label>
                            <Input
                              value={plan.price}
                              onChange={(e) => updatePricingPlan(planIndex, "price", e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Period (optional)</Label>
                            <Input
                              value={plan.period || ""}
                              onChange={(e) => updatePricingPlan(planIndex, "period", e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Button Text</Label>
                            <Input
                              value={plan.buttonText}
                              onChange={(e) => updatePricingPlan(planIndex, "buttonText", e.target.value)}
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Input
                            value={plan.description}
                            onChange={(e) => updatePricingPlan(planIndex, "description", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={plan.popular}
                              onChange={(e) => updatePricingPlan(planIndex, "popular", e.target.checked)}
                            />
                            <span>Mark as Popular</span>
                          </Label>
                        </div>
                        <div>
                          <Label>Features</Label>
                          {plan.features.map((feature, featureIndex) => (
                            <Input
                              key={featureIndex}
                              className="mt-2"
                              value={feature}
                              onChange={(e) => updatePlanFeature(planIndex, featureIndex, e.target.value)}
                              placeholder={`Feature ${featureIndex + 1}`}
                            />
                          ))}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="cta" className="space-y-4 mt-6">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="cta-title">CTA Title</Label>
                  <Input
                    id="cta-title"
                    value={content.cta.title}
                    onChange={(e) => updateCTA("title", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="cta-description">CTA Description</Label>
                  <textarea
                    id="cta-description"
                    className="w-full min-h-[100px] p-3 border rounded-md"
                    value={content.cta.description}
                    onChange={(e) => updateCTA("description", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cta-primary-btn">Primary Button Text</Label>
                    <Input
                      id="cta-primary-btn"
                      value={content.cta.primaryButton}
                      onChange={(e) => updateCTA("primaryButton", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cta-secondary-btn">Secondary Button Text</Label>
                    <Input
                      id="cta-secondary-btn"
                      value={content.cta.secondaryButton}
                      onChange={(e) => updateCTA("secondaryButton", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [openDialog, setOpenDialog] = useState(false)
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    plan: "free",
    company: "",
    website: "",
  })
  const [stats, setStats] = useState({ totalUsers: 0, activeUsers: 0, totalRevenue: 0, auditsThisMonth: 0 })
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [resetUser, setResetUser] = useState(null)
  const [newPassword, setNewPassword] = useState("")
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)

  // Normalize users for consistent display
  const normalizeUsers = (users) =>
    users.map((user) => ({
      ...user,
      plan: (user.subscription?.plan || "free").toLowerCase(),
      status: user.isActive ? "active" : "inactive",
    }))

  const fetchUsers = async () => {
    const token = localStorage.getItem("token")
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return normalizeUsers(res.data.data)
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token")
        const [statsRes, usersList] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats/dashboard`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetchUsers(),
        ])
        setStats(statsRes.data.data)
        setUsers(usersList)
      } catch (err) {
        toast.error("Failed to fetch dashboard data", {
          description: err?.response?.data?.message || "Check your server/API",
        })
      }
    }
    fetchDashboardData()
  }, [])

  const handleCreateUser = async () => {
    try {
      const token = localStorage.getItem("token")
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users`,
        {
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          role: "basic",
          subscription: { plan: newUser.plan, status: "active" },
          profile: { company: newUser.company, website: newUser.website },
        },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      toast.success("User created successfully")
      setOpenDialog(false)
      setNewUser({ name: "", email: "", password: "", plan: "free", company: "", website: "" })
      const updatedUsers = await fetchUsers()
      setUsers(updatedUsers)
    } catch (err) {
      toast.error("Error creating user", {
        description: err?.response?.data?.message || "Something went wrong",
      })
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
        subscription: { plan: editUser.role },
      }
      const res = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${editUser._id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success("User updated successfully")
      setIsEditDialogOpen(false)
      const updatedUsers = await fetchUsers()
      setUsers(updatedUsers)
    } catch (err) {
      toast.error("Failed to update user", {
        description: err?.response?.data?.message || "Something went wrong",
      })
    }
  }

  const handleResetPassword = async () => {
    try {
      const token = localStorage.getItem("token")
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${resetUser._id}`,
        { password: newPassword },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      toast.success("Password reset successfully")
      setIsResetDialogOpen(false)
      setNewPassword("")
    } catch (err) {
      toast.error("Failed to reset password", {
        description: err?.response?.data?.message || "Something went wrong",
      })
    }
  }

  const handleDeactivateUser = async (userId) => {
    try {
      const token = localStorage.getItem("token")
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}`,
        { isActive: false },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      toast.success("User deactivated successfully")
      const updatedUsers = await fetchUsers()
      setUsers(updatedUsers)
    } catch (err) {
      toast.error("Failed to deactivate user", {
        description: err?.response?.data?.message || "Something went wrong",
      })
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

                <Label>Company (optional)</Label>
                <Input value={newUser.company} onChange={(e) => setNewUser({ ...newUser, company: e.target.value })} />

                <Label>Website (optional)</Label>
                <Input value={newUser.website} onChange={(e) => setNewUser({ ...newUser, website: e.target.value })} />

                <Label>Plan</Label>
                <select
                  value={newUser.plan}
                  onChange={(e) => setNewUser({ ...newUser, plan: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="free">Free</option>
                  <option value="registered">Registered</option>
                  <option value="pro">Pro</option>
                </select>

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
            <TabsTrigger value="content">Content Management</TabsTrigger>
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
                      .filter(
                        (user) =>
                          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase()),
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
                                user.role === "pro"
                                  ? "default"
                                  : user.role === "basic"
                                    ? "secondary"
                                    : user.role === "admin"
                                      ? "destructive"
                                      : "outline"
                              }
                            >
                              {user.role || "free"}
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

          <TabsContent value="content" className="space-y-6">
            <ContentManagement />
          </TabsContent>
          {/* Analytics & Settings tabs can be added later */}
        </Tabs>
      </div>

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p>
              <strong>Name:</strong> {selectedUser?.name}
            </p>
            <p>
              <strong>Email:</strong> {selectedUser?.email}
            </p>
            {/* Do not display password for security */}
            <p>
              <strong>Role:</strong> {selectedUser?.role}
            </p>
            <p>
              <strong>Email Verified:</strong> {selectedUser?.emailVerified ? "Yes" : "No"}
            </p>
            <p>
              <strong>Company:</strong> {selectedUser?.profile?.company || "-"}
            </p>
            <p>
              <strong>Website:</strong> {selectedUser?.profile?.website || "-"}
            </p>
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

          {editUser && (
            <div className="space-y-4">
              <Label>Name</Label>
              <Input value={editUser.name || ""} onChange={(e) => setEditUser({ ...editUser, name: e.target.value })} />
              <Label>Email</Label>
              <Input
                type="email"
                value={editUser.email || ""}
                onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
              />
              <Label>Role</Label>
              <Input
                value={editUser.role || ""}
                onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                placeholder="e.g., basic, pro, admin"
              />
              <Label>Status</Label>
              <select
                value={editUser.status || "active"}
                onChange={(e) => setEditUser({ ...editUser, status: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          )}

          <DialogFooter>
            <Button onClick={handleUpdateUser}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
          </DialogHeader>
          <div>
            <Label>New Password</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </div>
          <DialogFooter>
            <Button onClick={handleResetPassword}>Reset</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
