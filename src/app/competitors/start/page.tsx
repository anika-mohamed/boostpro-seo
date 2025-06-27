"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { seoApi } from "@/lib/api/seo"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { Users, TrendingUp, ArrowLeft, Plus, X, BarChart3, Globe, Target, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { ProtectedRoute } from "@/components/auth/protected-route"

interface CompetitorData {
  url: string
  domain: string
  title: string
  metaDescription: string
  ranking: number
  keywordDensity: Array<{
    keyword: string
    density: number
    count: number
  }>
  contentLength: number
  headingStructure: {
    h1: string[]
    h2: string[]
    h3: string[]
  }
  backlinks: {
    estimated: number
    quality: string
  }
  socialSignals: {
    shares: number
    likes: number
  }
  technicalScore: number
}

interface CompetitorAnalysisResult {
  _id: string
  keywords: string[]
  userWebsite?: string
  competitors: CompetitorData[]
  analysis: {
    userSiteRanking?: number
    gapAnalysis: Array<{
      keyword: string
      userDensity: number
      avgCompetitorDensity: number
      recommendation: string
    }>
    contentGaps: string[]
    opportunities: string[]
    threats: string[]
  }
  summary: {
    totalCompetitors: number
    avgCompetitorScore: number
    userAdvantages: string[]
    improvementAreas: string[]
  }
  createdAt: string
}

function CompetitorStartContent() {
  const [keywords, setKeywords] = useState<string[]>([])
  const [currentKeyword, setCurrentKeyword] = useState("")
  const [userWebsite, setUserWebsite] = useState("")
  const [analysisResult, setAnalysisResult] = useState<CompetitorAnalysisResult | null>(null)
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/competitors"
              className="flex items-center text-sm font-medium hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Competitors
            </Link>
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Competitor Analysis</h1>
              <p className="text-gray-600">Analyze your competition and find opportunities</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-8">
        {/* Setup Form */}
        {!analysisResult && (
          <Card>
            <CardHeader>
              <CardTitle>Setup Competitor Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Keywords Input */}
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

              {/* User Website Input */}
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

              {/* Start Analysis Button */}
              <Button
                onClick={handleAnalysis}
                disabled={keywords.length === 0 || analysisMutation.isPending}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
              >
                {analysisMutation.isPending ? "Analyzing Competitors..." : "Start Analysis"}
              </Button>

              {/* Progress Bar */}
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
        )}

        {/* Analysis Results */}
        {analysisResult && (
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
            <Tabs defaultValue="competitors" className="space-y-6">
              <TabsList>
                <TabsTrigger value="competitors">Competitor Overview</TabsTrigger>
                <TabsTrigger value="gaps">Gap Analysis</TabsTrigger>
                <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
                <TabsTrigger value="insights">Strategic Insights</TabsTrigger>
              </TabsList>

              <TabsContent value="competitors" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Competitors for: {analysisResult.keywords.join(", ")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Rank</TableHead>
                            <TableHead>Domain</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Technical Score</TableHead>
                            <TableHead>Content Length</TableHead>
                            <TableHead>Backlinks</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(analysisResult.competitors || []).map((competitor, index) => (
                            <TableRow key={index}>
                              <TableCell>#{competitor.ranking}</TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{competitor.domain}</div>
                                  <div className="text-xs text-gray-500">{competitor.url}</div>
                                </div>
                              </TableCell>
                              <TableCell className="max-w-xs">
                                <div className="truncate" title={competitor.title}>
                                  {competitor.title}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <span>{competitor.technicalScore}/100</span>
                                  <Progress value={competitor.technicalScore} className="w-16 h-2" />
                                </div>
                              </TableCell>
                              <TableCell>{competitor.contentLength.toLocaleString()} words</TableCell>
                              <TableCell>
                                <div>
                                  <div>{competitor.backlinks.estimated.toLocaleString()}</div>
                                  <Badge className={getQualityColor(competitor.backlinks.quality)}>
                                    {competitor.backlinks.quality}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Button size="sm" variant="outline" asChild>
                                  <a href={competitor.url} target="_blank" rel="noopener noreferrer">
                                    <Globe className="h-3 w-3 mr-1" />
                                    Visit
                                  </a>
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="gaps" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Keyword Gap Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(analysisResult.analysis?.gapAnalysis || []).map((gap, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">"{gap.keyword}"</h4>
                            <div className="flex items-center space-x-4 text-sm">
                              <span>Your Density: {gap.userDensity?.toFixed(2) || 0}%</span>
                              <span>Competitor Avg: {gap.avgCompetitorDensity?.toFixed(2) || 0}%</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">{gap.recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="opportunities" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center space-x-2">
                        <Target className="h-5 w-5 text-green-600" />
                        <CardTitle className="text-green-800">Opportunities</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {(analysisResult.analysis?.opportunities || []).map((opportunity, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                            <span className="text-sm">{opportunity}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <CardTitle className="text-red-800">Threats</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {(analysisResult.analysis?.threats || []).map((threat, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                            <span className="text-sm">{threat}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Content Gaps</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 md:grid-cols-2">
                      {(analysisResult.analysis?.contentGaps || []).map((gap, index) => (
                        <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded">
                          <div className="flex items-center space-x-2">
                            <BarChart3 className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium">{gap}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="insights" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-green-800">Your Advantages</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {(analysisResult.summary?.userAdvantages || []).map((advantage, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                            <span className="text-sm">{advantage}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-orange-800">Improvement Areas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {(analysisResult.summary?.improvementAreas || []).map((area, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <Target className="h-4 w-4 text-orange-500 mt-0.5" />
                            <span className="text-sm">{area}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Button onClick={() => setAnalysisResult(null)} variant="outline">
                Start New Analysis
              </Button>
              <Button asChild>
                <Link href="/competitors">View All Analyses</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CompetitorStartPage() {
  return (
    <ProtectedRoute requiredPlan="basic">
      <CompetitorStartContent />
    </ProtectedRoute>
  )
}
