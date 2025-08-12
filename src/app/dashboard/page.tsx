"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  Search,
  BarChart3,
  Users,
  FileText,
  LogOut,
  Plus,
  ImageIcon,
} from "lucide-react"

import { useAuth } from "@/lib/hooks/use-auth"
import { useSeoQueries } from "@/lib/hooks/use-seo-queries"
import { ProtectedRoute } from "@/components/auth/protected-route"

type AltTagImage = {
  id: string
  url: string
  alt?: string | null
  description?: string | null
}

function DashboardContent() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const { useAuditHistory } = useSeoQueries()
  const { data: auditHistoryResponse, isLoading: auditsLoading } = useAuditHistory()

  // Example alt tag images state (replace with real data fetch)
  const [altTagImages, setAltTagImages] = useState<AltTagImage[]>([
    { id: "1", url: "/images/sample1.jpg", alt: null, description: "" },
    { id: "2", url: "/images/sample2.jpg", alt: null, description: "" },
    { id: "3", url: "/images/sample3.jpg", alt: null, description: "" },
  ])

  // Redirect admin users to /admin
  useEffect(() => {
    if (user?.role === "admin") {
      router.push("/admin")
    }
  }, [user, router])

  const recentAudits = Array.isArray(auditHistoryResponse?.data)
    ? auditHistoryResponse.data.slice(0, 3)
    : []

  const avgScore =
    recentAudits.length > 0
      ? Math.round(
          recentAudits.reduce((sum, audit) => sum + (audit.overallScore || 0), 0) / recentAudits.length,
        )
      : 0

  const planLimits = {
    free: { audits: 1, keywords: 5, content: 0 },
    basic: { audits: 50, keywords: 100, content: 10 },
    pro: { audits: 999, keywords: 999, content: 999 },
  }

  const currentLimits = planLimits[user?.subscription?.plan as keyof typeof planLimits] || planLimits.free

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">SEO Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name || "User"}!</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant={user?.subscription?.plan === "pro" ? "default" : "secondary"}>
              {user?.subscription?.plan === "pro"
                ? "Pro User"
                : user?.subscription?.plan === "basic"
                ? "Basic User"
                : "Free User"}
            </Badge>
            <Link href="/audit">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Audit
              </Button>
            </Link>
            <Button variant="outline" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average SEO Score</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgScore}/100</div>
              <Progress value={avgScore} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Audits This Month</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user?.usage?.auditsThisMonth || 0}</div>
              <p className="text-xs text-muted-foreground">
                {currentLimits.audits === 999
                  ? "Unlimited"
                  : `${currentLimits.audits - (user?.usage?.auditsThisMonth || 0)} remaining`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Keyword Searches</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user?.usage?.keywordSearchesThisMonth || 0}</div>
              <p className="text-xs text-muted-foreground">
                {currentLimits.keywords === 999
                  ? "Unlimited"
                  : `${currentLimits.keywords - (user?.usage?.keywordSearchesThisMonth || 0)} remaining`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Account Status</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{user?.isActive ? "Active" : "Inactive"}</div>
              <p className="text-xs text-muted-foreground">
                Since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="audits">Recent Audits</TabsTrigger>
            <TabsTrigger value="keywords">Keyword Research</TabsTrigger>
            <TabsTrigger value="competitors">Competitor Analysis</TabsTrigger>
            <TabsTrigger value="content">Content Optimize</TabsTrigger>
            <TabsTrigger value="alt-tags">Image ALT Tags</TabsTrigger>
            <TabsTrigger value="upgrade">Upgrade Plan</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Recent Audits Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Audits</CardTitle>
                  <CardDescription>Your latest website audits</CardDescription>
                </CardHeader>
                <CardContent>
                  {auditsLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : recentAudits.length > 0 ? (
                    <div className="space-y-4">
                      {recentAudits.map((audit) => (
                        <div key={audit._id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{audit.url}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(audit.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{audit.overallScore}/100</div>
                            <Badge variant={audit.status === "completed" ? "default" : "secondary"}>
                              {audit.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500 mb-4">No audits yet</p>
                      <Link href="/audit">
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Run Your First Audit
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks and tools</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Link href="/audit" className="block">
                      <Button className="w-full justify-start" variant="outline">
                        <Search className="h-4 w-4 mr-2" />
                        Run SEO Audit
                      </Button>
                    </Link>
                    <Link href="/keywords" className="block">
                      <Button className="w-full justify-start" variant="outline">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Keyword Research
                      </Button>
                    </Link>
                    <Link href="/competitors" className="block">
                      <Button className="w-full justify-start" variant="outline">
                        <Users className="h-4 w-4 mr-2" />
                        Competitor Analysis
                      </Button>
                    </Link>
                    <Link href="/content" className="block">
                      <Button className="w-full justify-start" variant="outline">
                        <Users className="h-4 w-4 mr-2" />
                        Content Optimizer
                      </Button>
                    </Link>
                    <Link href="/alt-tags" className="block">
                      <Button className="w-full justify-start" variant="outline">
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Image ALT Tags
                      </Button>
                    </Link>
                    <Link href="/reports" className="block">
                      <Button className="w-full justify-start" variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        Reports & Progress
                      </Button>
                    </Link>
                    <Link href="/upgrade" className="block">
                      <Button className="w-full justify-start" variant="outline">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Upgrade Plan
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Audits Tab */}
          <TabsContent value="audits" className="space-y-6">
            {/* Same audits card content as before */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Audit History</CardTitle>
                    <CardDescription>All your website audits</CardDescription>
                  </div>
                  <Link href="/audit">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      New Audit
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {auditsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse border rounded p-4">
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    ))}
                  </div>
                ) : recentAudits.length > 0 ? (
                  <div className="space-y-4">
                    {recentAudits.map((audit) => (
                      <div key={audit._id} className="border rounded p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{audit.url}</h3>
                          <Badge variant={audit.status === "completed" ? "default" : "secondary"}>
                            {audit.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Overall Score:</span>
                            <div className="font-bold">{audit.overallScore}/100</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Performance:</span>
                            <div className="font-bold">{audit.pageSpeedData?.desktop?.score || 0}/100</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Issues:</span>
                            <div className="font-bold">{audit.seoIssues?.length || 0}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Date:</span>
                            <div>{new Date(audit.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No audits found</p>
                    <Link href="/audit">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Run Your First Audit
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Keywords Tab */}
          <TabsContent value="keywords" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Keyword Research</CardTitle>
                <CardDescription>Analyze and research SEO keywords</CardDescription>
              </CardHeader>
              <CardContent>
                <p>This is where keyword research tools and data will appear.</p>
                {/* You can add your keyword research components here */}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Competitors Tab */}
          <TabsContent value="competitors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Competitor Analysis</CardTitle>
                <CardDescription>Monitor your SEO competitors</CardDescription>
              </CardHeader>
              <CardContent>
                <p>This is where competitor analysis tools and data will appear.</p>
                {/* Add competitor components here */}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Optimization</CardTitle>
                <CardDescription>Improve your content for better SEO</CardDescription>
              </CardHeader>
              <CardContent>
                <p>This is where content optimization tools and data will appear.</p>
                {/* Add content optimization components here */}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alt Tags Tab */}
          <TabsContent value="alt-tags" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Image ALT Tags</CardTitle>
                <CardDescription>Generate and manage SEO-friendly ALT tags for your images.</CardDescription>
              </CardHeader>
              <CardContent>
                <p>This is where the ALT tag generation UI will be.</p>
                <Link href="/alt-tags">
                  <Button className="mt-4">
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Go to ALT Tag Generator
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Upgrade Tab */}
          <TabsContent value="upgrade" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upgrade Your Plan</CardTitle>
                <CardDescription>Unlock more features and higher limits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-6">
                    You're currently on the <strong>{user?.subscription?.plan || "free"}</strong> plan.
                  </p>
                  <Link href="/upgrade">
                    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      View Upgrade Options
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <ProtectedRoute requiredPlan="registered">
      <DashboardContent />
    </ProtectedRoute>
  )
}
