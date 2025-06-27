"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { seoApi } from "@/lib/api/seo"
import { useSeoQueries } from "@/lib/hooks/use-seo-queries"
import { useAuth } from "@/lib/hooks/use-auth"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { Users, TrendingUp, ArrowLeft, Plus, X, BarChart3, Globe, Target, AlertTriangle } from "lucide-react"
import Link from "next/link"

function CompetitorStartContent() {
  const [keywords, setKeywords] = useState<string[]>([])
  const [currentKeyword, setCurrentKeyword] = useState("")
  const [userWebsite, setUserWebsite] = useState("")
  const [analysisResult, setAnalysisResult] = useState<any | null>(null)
  const [progress, setProgress] = useState(0)

  const analysisMutation = useMutation({
    mutationFn: ({ keywords, userWebsite }: { keywords: string[]; userWebsite?: string }) =>
      seoApi.analyzeCompetitors(keywords, userWebsite),
    onSuccess: (data) => {
      setAnalysisResult(data.data)
      setProgress(100)
      toast.success("Competitor analysis completed!")
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Analysis failed")
      setProgress(0)
    },
  })

  const addKeyword = () => {
    if (currentKeyword.trim() && keywords.length < 3 && !keywords.includes(currentKeyword.trim())) {
      setKeywords([...keywords, currentKeyword.trim()])
      setCurrentKeyword("")
    }
  }

  const removeKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index))
  }

  const handleAnalysis = () => {
    if (keywords.length === 0) {
      toast.error("Please add at least one keyword")
      return
    }

    setProgress(10)
    analysisMutation.mutate({ keywords, userWebsite: userWebsite || undefined })

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval)
          return 90
        }
        return prev + 10
      })
    }, 2000)
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "high":
        return "text-green-600 bg-green-100"
      case "medium":
        return "text-yellow-600 bg-yellow-100"
      case "low":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  if (!analysisResult) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Setup Competitor Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Target Keywords (1-3 keywords)</label>
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="Enter a keyword (e.g., 'digital marketing')"
                value={currentKeyword}
                onChange={(e) => setCurrentKeyword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addKeyword()}
                disabled={keywords.length >= 3}
              />
              <Button
                onClick={addKeyword}
                disabled={!currentKeyword.trim() || keywords.length >= 3}
                variant="outline"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {keyword}
                  <button onClick={() => removeKeyword(index)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Your Website (Optional)</label>
            <Input
              placeholder="https://yourwebsite.com"
              value={userWebsite}
              onChange={(e) => setUserWebsite(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Include your website to see how you compare against competitors
            </p>
          </div>

          <Button
            onClick={handleAnalysis}
            disabled={keywords.length === 0 || analysisMutation.isPending}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
          >
            {analysisMutation.isPending ? "Analyzing Competitors..." : "Start Analysis"}
          </Button>

          {analysisMutation.isPending && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Analysis Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
              <p className="text-sm text-gray-500">
                {progress < 30
                  ? "Searching for competitors..."
                  : progress < 60
                  ? "Analyzing competitor websites..."
                  : progress < 90
                  ? "Generating insights..."
                  : "Finalizing results..."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{analysisResult.summary?.totalCompetitors || 0}</div>
              <div className="text-sm text-gray-500">Competitors Found</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{analysisResult.summary?.avgCompetitorScore || 0}</div>
              <div className="text-sm text-gray-500">Avg. Technical Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{analysisResult.analysis?.gapAnalysis?.length || 0}</div>
              <div className="text-sm text-gray-500">Keyword Gaps</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{analysisResult.analysis?.opportunities?.length || 0}</div>
              <div className="text-sm text-gray-500">Opportunities</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results */}
      {/* (Reuse the detailed Tabs content from your existing start page) */}
      {/* ... For brevity, you can insert your full TabsContent here from your previous code ... */}

      <Button onClick={() => setAnalysisResult(null)} variant="outline">
        Start New Analysis
      </Button>
    </div>
  )
}

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
        </div>
      </header>

      <div className="p-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="new-analysis">New Analysis</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
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
                      <Button onClick={() => window?.alert("Go to New Analysis tab to start!")}>
                        Start First Analysis
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Tools */}
              {/* (optional, keep or remove as you like) */}
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Competitor Analyses</CardTitle>
                    <CardDescription>Explore past analysis records</CardDescription>
                  </div>
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

          {/* New Analysis Tab */}
          <TabsContent value="new-analysis">
            <CompetitorStartContent />
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
