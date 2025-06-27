"use client"

import type React from "react"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { seoApi } from "@/lib/api/seo"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import {
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Download,
  ArrowLeft,
  Lightbulb,
  Target,
} from "lucide-react"
import Link from "next/link"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface KeywordSuggestion {
  keyword: string
  searchVolume: number
  competition: "low" | "medium" | "high"
  cpc: number
  difficulty: number
  trend: {
    direction: "up" | "down" | "stable"
    data: number[]
  }
  relatedQueries: string[]
}

interface KeywordResearchResult {
  seedKeyword: string
  suggestions: KeywordSuggestion[]
  trendData: {
    timeframe: string
    region: string
    data: Array<{ date: string; value: number }>
  }
  cached: boolean
  createdAt: string
}

function KeywordPageContent() {
  const [keyword, setKeyword] = useState("")
  const [selectedKeyword, setSelectedKeyword] = useState<KeywordSuggestion | null>(null)
  const [currentResult, setCurrentResult] = useState<KeywordResearchResult | null>(null)
  const queryClient = useQueryClient()

  // Get keyword history
  const { data: historyData, isLoading: loadingHistory } = useQuery({
    queryKey: ["keywordHistory"],
    queryFn: seoApi.getKeywordHistory,
  })

  // Get trending keywords
  const { data: trendingData, isLoading: loadingTrending } = useQuery({
    queryKey: ["trendingKeywords"],
    queryFn: seoApi.getTrendingKeywords,
  })

  // Suggest keyword mutation
  const suggestMutation = useMutation({
    mutationFn: (kw: string) => seoApi.suggestKeyword(kw),
    onSuccess: (data) => {
      setCurrentResult(data)
      toast.success("Keyword research completed!")
      queryClient.invalidateQueries({ queryKey: ["keywordHistory"] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Research failed")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!keyword.trim()) return
    suggestMutation.mutate(keyword)
  }

  const getCompetitionColor = (competition: string) => {
    switch (competition) {
      case "low":
        return "text-green-600 bg-green-100"
      case "medium":
        return "text-yellow-600 bg-yellow-100"
      case "high":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 30) return "text-green-600"
    if (difficulty <= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const exportKeywords = () => {
    if (!currentResult) return

    const csvContent = [
      ["Keyword", "Search Volume", "Competition", "CPC", "Difficulty", "Trend"],
      ...currentResult.suggestions.map((kw) => [
        kw.keyword,
        kw.searchVolume.toString(),
        kw.competition,
        `$${kw.cpc}`,
        kw.difficulty.toString(),
        kw.trend.direction,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `keyword-research-${currentResult.seedKeyword}-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="flex items-center text-sm font-medium hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
            <div className="bg-gradient-to-r from-green-600 to-blue-600 p-2 rounded-lg">
              <Search className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Keyword Research</h1>
              <p className="text-gray-600">Discover high-potential keywords and analyze trends</p>
            </div>
          </div>
          {currentResult && (
            <Button onClick={exportKeywords} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          )}
        </div>
      </header>

      <div className="p-6 space-y-8">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Keyword Research</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex gap-4 items-center">
              <Input
                placeholder="Enter a seed keyword (e.g., 'digital marketing')"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="max-w-md"
                disabled={suggestMutation.isPending}
              />
              <Button
                type="submit"
                disabled={suggestMutation.isPending || !keyword.trim()}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              >
                {suggestMutation.isPending ? "Researching..." : "Research Keywords"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results Section */}
        {currentResult && (
          <Tabs defaultValue="suggestions" className="space-y-6">
            <TabsList>
              <TabsTrigger value="suggestions">Keyword Suggestions</TabsTrigger>
              <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
              <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            </TabsList>

            <TabsContent value="suggestions" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Keyword Suggestions for "{currentResult.seedKeyword}"</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        Found {currentResult.suggestions.length} related keywords
                        {currentResult.cached && " (cached results)"}
                      </p>
                    </div>
                    <Badge variant={currentResult.cached ? "secondary" : "default"}>
                      {currentResult.cached ? "Cached" : "Fresh"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Keyword</TableHead>
                          <TableHead>Search Volume</TableHead>
                          <TableHead>Competition</TableHead>
                          <TableHead>CPC</TableHead>
                          <TableHead>Difficulty</TableHead>
                          <TableHead>Trend</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentResult.suggestions.map((suggestion, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{suggestion.keyword}</TableCell>
                            <TableCell>{suggestion.searchVolume.toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge className={getCompetitionColor(suggestion.competition)}>
                                {suggestion.competition}
                              </Badge>
                            </TableCell>
                            <TableCell>${suggestion.cpc.toFixed(2)}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <span className={getDifficultyColor(suggestion.difficulty)}>
                                  {suggestion.difficulty}
                                </span>
                                <Progress value={suggestion.difficulty} className="w-16 h-2" />
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                {getTrendIcon(suggestion.trend.direction)}
                                <span className="text-sm capitalize">{suggestion.trend.direction}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button size="sm" variant="outline" onClick={() => setSelectedKeyword(suggestion)}>
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Keyword Details Modal */}
              {selectedKeyword && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Keyword Details: "{selectedKeyword.keyword}"</CardTitle>
                      <Button variant="outline" onClick={() => setSelectedKeyword(null)}>
                        Close
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <h4 className="font-medium mb-3">Metrics</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Search Volume:</span>
                            <span className="font-medium">{selectedKeyword.searchVolume.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Competition:</span>
                            <Badge className={getCompetitionColor(selectedKeyword.competition)}>
                              {selectedKeyword.competition}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Cost Per Click:</span>
                            <span className="font-medium">${selectedKeyword.cpc.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>SEO Difficulty:</span>
                            <span className={getDifficultyColor(selectedKeyword.difficulty)}>
                              {selectedKeyword.difficulty}/100
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-3">Related Queries</h4>
                        <div className="space-y-1">
                          {selectedKeyword.relatedQueries.map((query, index) => (
                            <div key={index} className="text-sm bg-gray-100 px-2 py-1 rounded">
                              {query}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Trend Chart */}
                    <div className="mt-6">
                      <h4 className="font-medium mb-3">12-Month Trend</h4>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={selectedKeyword.trend.data.map((value, index) => ({
                              month: `Month ${index + 1}`,
                              value,
                            }))}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Trend Analysis for "{currentResult.seedKeyword}"</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <h4 className="font-medium mb-3">Trend Overview</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Timeframe:</span>
                          <span className="font-medium">{currentResult.trendData.timeframe}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Region:</span>
                          <span className="font-medium">{currentResult.trendData.region}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3">Key Insights</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span>Peak interest in recent months</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <BarChart3 className="h-4 w-4 text-blue-500" />
                          <span>Seasonal patterns detected</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main Trend Chart */}
                  <div className="mt-6">
                    <h4 className="font-medium mb-3">Search Interest Over Time</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={currentResult.trendData.data}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="opportunities" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    <CardTitle>Keyword Opportunities</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Low Competition Keywords */}
                    <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Target className="h-4 w-4 text-green-600" />
                        <h4 className="font-medium text-green-800">Low Competition Opportunities</h4>
                      </div>
                      <div className="space-y-2">
                        {currentResult.suggestions
                          .filter((kw) => kw.competition === "low" && kw.searchVolume > 1000)
                          .slice(0, 3)
                          .map((kw, index) => (
                            <div key={index} className="text-sm">
                              <span className="font-medium">{kw.keyword}</span>
                              <span className="text-green-600 ml-2">
                                ({kw.searchVolume.toLocaleString()} searches, {kw.difficulty} difficulty)
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* High Volume Keywords */}
                    <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        <h4 className="font-medium text-blue-800">High Volume Targets</h4>
                      </div>
                      <div className="space-y-2">
                        {currentResult.suggestions
                          .sort((a, b) => b.searchVolume - a.searchVolume)
                          .slice(0, 3)
                          .map((kw, index) => (
                            <div key={index} className="text-sm">
                              <span className="font-medium">{kw.keyword}</span>
                              <span className="text-blue-600 ml-2">
                                ({kw.searchVolume.toLocaleString()} searches/month)
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Long-tail Opportunities */}
                    <div className="p-4 border border-purple-200 bg-purple-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Search className="h-4 w-4 text-purple-600" />
                        <h4 className="font-medium text-purple-800">Long-tail Keywords</h4>
                      </div>
                      <div className="space-y-2">
                        {currentResult.suggestions
                          .filter((kw) => kw.keyword.split(" ").length >= 3)
                          .slice(0, 3)
                          .map((kw, index) => (
                            <div key={index} className="text-sm">
                              <span className="font-medium">{kw.keyword}</span>
                              <span className="text-purple-600 ml-2">
                                (Lower competition, higher conversion potential)
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Trending Keywords */}
        <Card>
          <CardHeader>
            <CardTitle>Trending Keywords</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingTrending ? (
              <p>Loading trends...</p>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trendingData?.map((trend: any, index: number) => (
                  <div key={index} className="border rounded p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{trend.keyword}</p>
                      {getTrendIcon(trend.trend)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Volume: {trend.searchVolume?.toLocaleString() || "N/A"}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setKeyword(trend.keyword)
                        suggestMutation.mutate(trend.keyword)
                      }}
                      disabled={suggestMutation.isPending}
                    >
                      Research This
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Keyword History */}
        <Card>
          <CardHeader>
            <CardTitle>Research History</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingHistory ? (
              <p>Loading history...</p>
            ) : historyData?.length > 0 ? (
              <div className="space-y-4">
                {historyData.map((item: any) => (
                  <div key={item._id} className="border rounded p-4">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-semibold">{item.seedKeyword}</p>
                      <span className="text-sm text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Found {item.suggestions?.length || 0} keyword suggestions
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      onClick={() => {
                        setKeyword(item.seedKeyword)
                        suggestMutation.mutate(item.seedKeyword)
                      }}
                      disabled={suggestMutation.isPending}
                    >
                      Research Again
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No research history found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function KeywordsPage() {
  return (
    <ProtectedRoute requiredPlan="registered">
      <KeywordPageContent />
    </ProtectedRoute>
  )
}
