"use client"

import { useSeoQueries } from "@/lib/hooks/use-seo-queries"
import { useAuth } from "@/lib/hooks/use-auth"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { TrendingUp, BarChart3, Search, FileText, Users, Plus } from "lucide-react"

function CompetitorPageContent() {
  const { user } = useAuth()
  const { useCompetitorHistory } = useSeoQueries()
  const { data: historyData, isLoading } = useCompetitorHistory()

  const recentCompetitors = Array.isArray(historyData?.data) ? historyData.data.slice(0, 3) : []
  const total = historyData?.total || 0

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 p-2 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Competitor Analysis</h1>
              <p className="text-gray-600">Insights into your top competitors</p>
            </div>
          </div>
          <Link href="/competitors/start">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Analysis
            </Button>
          </Link>
        </div>
      </header>

      <div className="p-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Competitor Analyses</CardTitle>
                  <CardDescription>Your latest keyword-based scans</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : recentCompetitors.length > 0 ? (
                    <div className="space-y-4">
                      {recentCompetitors.map((analysis) => (
                        <div key={analysis._id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{analysis.keywords.join(", ")}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(analysis.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{analysis.summary?.avgCompetitorScore || 0}/100</div>
                            <Badge>{analysis.summary?.totalCompetitors || 0} competitors</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500 mb-4">No competitor analysis yet</p>
                      <Link href="/competitors/start">
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Start First Analysis
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Tools</CardTitle>
                  <CardDescription>Useful tools at your fingertips</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Link href="/audit">
                      <Button className="w-full justify-start" variant="outline">
                        <Search className="h-4 w-4 mr-2" /> Run SEO Audit
                      </Button>
                    </Link>
                    <Link href="/keywords">
                      <Button className="w-full justify-start" variant="outline">
                        <BarChart3 className="h-4 w-4 mr-2" /> Keyword Research
                      </Button>
                    </Link>
                    <Link href="/competitors/start">
                      <Button className="w-full justify-start" variant="outline">
                        <Users className="h-4 w-4 mr-2" /> Competitor Analysis
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Competitor Analyses</CardTitle>
                    <CardDescription>Explore past analysis records</CardDescription>
                  </div>
                  <Link href="/competitors/start">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      New Analysis
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse border rounded p-4">
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    ))}
                  </div>
                ) : recentCompetitors.length > 0 ? (
                  <div className="space-y-4">
                    {recentCompetitors.map((analysis) => (
                      <div key={analysis._id} className="border rounded p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{analysis.keywords.join(", ")}</h3>
                          <Badge>{analysis.summary?.totalCompetitors || 0} competitors</Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Avg Score:</span>
                            <div className="font-bold">{analysis.summary?.avgCompetitorScore || 0}/100</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Your Website:</span>
                            <div>{analysis.userWebsite}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Created:</span>
                            <div>{new Date(analysis.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500 mb-4">No records available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function CompetitorPage() {
  return (
    <ProtectedRoute requiredPlan="basic">
      <CompetitorPageContent />
    </ProtectedRoute>
  )
}
