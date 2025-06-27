"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, AlertCircle, CheckCircle, Download, RefreshCw, TrendingUp, ArrowLeft, Brain } from "lucide-react"
import { seoApi } from "@/lib/api/seo"
import { toast } from "sonner"
import Link from "next/link"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { SwotAnalysisComponent } from "@/components/seo/swot-analysis"

interface AuditResult {
  _id: string
  url: string
  domain: string
  overallScore: number
  pageSpeedData: {
    desktop: {
      score: number
      fcp: number
      lcp: number
      cls: number
      fid: number
      ttfb: number
    }
    mobile: {
      score: number
      fcp: number
      lcp: number
      cls: number
      fid: number
      ttfb: number
    }
  }
  technicalSeo: {
    metaTitle: {
      exists: boolean
      length: number
      content: string
      isOptimal?: boolean
    }
    metaDescription: {
      exists: boolean
      length: number
      content: string
      isOptimal?: boolean
    }
    headings: {
      h1Count: number
      h2Count: number
      h3Count: number
      structure: Array<{ tag: string; text: string }>
      h1Text: string[]
    }
    images: {
      total: number
      withoutAlt: number
      withEmptyAlt?: number
      oversized: number
    }
    links: {
      internal: number
      external: number
      broken: number
      externalDomains?: string[]
    }
    schema: {
      exists: boolean
      types: string[]
    }
    openGraph?: {
      exists: boolean
      hasTitle: boolean
      hasDescription: boolean
      hasImage: boolean
    }
  }
  seoIssues: Array<{
    category: "critical" | "warning" | "info"
    title: string
    description: string
    impact: "high" | "medium" | "low"
    suggestion: string
  }>
  recommendations: Array<{
    priority: "high" | "medium" | "low"
    category: string
    title: string
    description: string
    estimatedImpact: string
  }>
  swotAnalysis?: {
    strengths: string[]
    weaknesses: string[]
    opportunities: string[]
    threats: string[]
    generatedBy: "ai" | "rules"
  }
  status: "pending" | "completed" | "failed"
  createdAt: string
}

function AuditPageContent() {
  const [url, setUrl] = useState("")
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null)
  const [auditId, setAuditId] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  // Mutation for starting audit
  const startAuditMutation = useMutation({
    mutationFn: (url: string) => seoApi.runAudit(url),
    onSuccess: (data) => {
      console.log("Audit started:", data)
      setAuditId(data.data.auditId)
      toast.success("Audit started successfully!")
      // Start polling for results
      pollAuditStatus(data.data.auditId)
    },
    onError: (error: any) => {
      console.error("Audit start error:", error)
      toast.error(error.response?.data?.message || "Failed to start audit")
    },
  })

  const pollAuditStatus = async (id: string) => {
    let attempts = 0
    const maxAttempts = 60 // 5 minutes max

    const poll = async () => {
      try {
        attempts++
        setProgress(Math.min(95, (attempts / maxAttempts) * 100))

        console.log(`Polling attempt ${attempts} for audit ${id}`)

        const response = await seoApi.getAuditById(id)
        console.log("Audit status response:", response)

        const audit = response.data

        if (audit.status === "completed") {
          setAuditResult(audit)
          setProgress(100)
          toast.success("Audit completed!")
          return
        } else if (audit.status === "failed") {
          toast.error("Audit failed. Please try again.")
          setProgress(0)
          return
        }

        // Continue polling if still pending
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000) // Poll every 5 seconds
        } else {
          toast.error("Audit timed out. Please try again.")
          setProgress(0)
        }
      } catch (error: any) {
        console.error("Polling error:", error)

        // If it's a 404, the audit might not exist yet, continue polling
        if (error.response?.status === 404 && attempts < 10) {
          console.log("Audit not found yet, continuing to poll...")
          setTimeout(poll, 5000)
          return
        }

        if (attempts < maxAttempts) {
          setTimeout(poll, 5000)
        } else {
          toast.error("Failed to get audit results")
          setProgress(0)
        }
      }
    }

    poll()
  }

  const handleAudit = async () => {
    if (!url) {
      toast.error("Please enter a valid URL")
      return
    }

    try {
      new URL(url) // Validate URL
    } catch {
      toast.error("Please enter a valid URL")
      return
    }

    setAuditResult(null)
    setProgress(0)
    startAuditMutation.mutate(url)
  }

  const isAuditing = startAuditMutation.isPending || (progress > 0 && progress < 100 && !auditResult)

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
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
              <Search className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">SEO Audit</h1>
              <p className="text-gray-600">Analyze your website's SEO performance</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Debug Info */}
        {process.env.NODE_ENV === "development" && (
          <Card className="mb-4 bg-yellow-50 border-yellow-200">
            <CardContent className="pt-4">
              <p className="text-sm text-yellow-800">
                <strong>Debug Info:</strong> API URL: {process.env.NEXT_PUBLIC_API_URL || "Not set"}
                {auditId && ` | Current Audit ID: ${auditId}`}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Audit Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Website SEO Audit</CardTitle>
            <CardDescription>Enter your website URL to get a comprehensive SEO analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <div className="flex-1">
                <Label htmlFor="url">Website URL</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="mt-1"
                  disabled={isAuditing}
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleAudit}
                  disabled={!url || isAuditing}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isAuditing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Start Audit
                    </>
                  )}
                </Button>
              </div>
            </div>

            {isAuditing && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Audit Progress</span>
                  <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} />
                <p className="text-sm text-gray-500 mt-2">
                  {progress < 30
                    ? "Starting audit and analyzing page structure..."
                    : progress < 60
                      ? "Running PageSpeed analysis..."
                      : progress < 90
                        ? "Analyzing technical SEO elements..."
                        : "Finalizing results..."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Audit Results */}
        {auditResult && (
          <div className="space-y-6">
            {/* Overall Score */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Audit Results for {auditResult.url}</CardTitle>
                    <CardDescription>Completed {new Date(auditResult.createdAt).toLocaleString()}</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download Report
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">{auditResult.overallScore}</div>
                    <div className="text-sm text-gray-500">Overall Score</div>
                    <Progress value={auditResult.overallScore} className="mt-2" />
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-2">{auditResult.pageSpeedData.desktop.score}</div>
                    <div className="text-sm text-gray-500">Desktop Performance</div>
                    <Progress value={auditResult.pageSpeedData.desktop.score} className="mt-2" />
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-2">{auditResult.pageSpeedData.mobile.score}</div>
                    <div className="text-sm text-gray-500">Mobile Performance</div>
                    <Progress value={auditResult.pageSpeedData.mobile.score} className="mt-2" />
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-2">
                      {auditResult.technicalSeo.metaTitle.exists && auditResult.technicalSeo.metaDescription.exists
                        ? 85
                        : 65}
                    </div>
                    <div className="text-sm text-gray-500">SEO Basics</div>
                    <Progress
                      value={
                        auditResult.technicalSeo.metaTitle.exists && auditResult.technicalSeo.metaDescription.exists
                          ? 85
                          : 65
                      }
                      className="mt-2"
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-2">
                      {Math.round(
                        100 -
                          ((auditResult.technicalSeo.images.withoutAlt || 0) /
                            Math.max(1, auditResult.technicalSeo.images.total || 1)) *
                            100,
                      )}
                    </div>
                    <div className="text-sm text-gray-500">Accessibility</div>
                    <Progress
                      value={Math.round(
                        100 -
                          ((auditResult.technicalSeo.images.withoutAlt || 0) /
                            Math.max(1, auditResult.technicalSeo.images.total || 1)) *
                            100,
                      )}
                      className="mt-2"
                    />
                  </div>
                </div>

                {/* Core Web Vitals */}
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-4">Core Web Vitals</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-medium mb-2">Desktop</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">FCP</div>
                          <div className="font-bold">{auditResult.pageSpeedData.desktop.fcp}s</div>
                        </div>
                        <div>
                          <div className="text-gray-500">LCP</div>
                          <div className="font-bold">{auditResult.pageSpeedData.desktop.lcp}s</div>
                        </div>
                        <div>
                          <div className="text-gray-500">CLS</div>
                          <div className="font-bold">{auditResult.pageSpeedData.desktop.cls}</div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Mobile</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">FCP</div>
                          <div className="font-bold">{auditResult.pageSpeedData.mobile.fcp}s</div>
                        </div>
                        <div>
                          <div className="text-gray-500">LCP</div>
                          <div className="font-bold">{auditResult.pageSpeedData.mobile.lcp}s</div>
                        </div>
                        <div>
                          <div className="text-gray-500">CLS</div>
                          <div className="font-bold">{auditResult.pageSpeedData.mobile.cls}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Results */}
            <Tabs defaultValue="issues" className="space-y-6">
              <TabsList>
                <TabsTrigger value="issues">Issues & Recommendations</TabsTrigger>
                <TabsTrigger value="technical">Technical Details</TabsTrigger>
                <TabsTrigger value="swot">
                  <Brain className="h-4 w-4 mr-2" />
                  SWOT Analysis
                </TabsTrigger>
                <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
              </TabsList>

              <TabsContent value="issues" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Issues */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Issues Found</CardTitle>
                      <CardDescription>Problems that need attention</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {auditResult.seoIssues?.length > 0 ? (
                          auditResult.seoIssues.map((issue, index) => (
                            <div key={index} className="flex items-start space-x-3">
                              <div className="mt-1">
                                {issue.category === "critical" && <AlertCircle className="h-4 w-4 text-red-500" />}
                                {issue.category === "warning" && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                                {issue.category === "info" && <AlertCircle className="h-4 w-4 text-blue-500" />}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium">{issue.title}</p>
                                <p className="text-xs text-gray-600 mt-1">{issue.description}</p>
                                <Badge
                                  variant={
                                    issue.impact === "high"
                                      ? "destructive"
                                      : issue.impact === "medium"
                                        ? "secondary"
                                        : "outline"
                                  }
                                  className="mt-1"
                                >
                                  {issue.impact} impact
                                </Badge>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-center py-4">No critical issues found!</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recommendations */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recommendations</CardTitle>
                      <CardDescription>Actions to improve your SEO</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {auditResult.recommendations?.length > 0 ? (
                          auditResult.recommendations.map((rec, index) => (
                            <div key={index} className="flex items-start space-x-3">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                              <div className="flex-1">
                                <p className="text-sm font-medium">{rec.title}</p>
                                <p className="text-xs text-gray-600 mt-1">{rec.description}</p>
                                <Badge variant="outline" className="mt-1">
                                  {rec.priority} priority
                                </Badge>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-center py-4">Great! No major recommendations needed.</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="technical" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Meta Tags</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Title Tag</span>
                          {auditResult.technicalSeo.metaTitle.exists ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        {auditResult.technicalSeo.metaTitle.exists && (
                          <div>
                            <p className="text-xs text-gray-600 mb-1">
                              Length: {auditResult.technicalSeo.metaTitle.length} characters
                            </p>
                            <p className="text-sm bg-gray-50 p-2 rounded">
                              {auditResult.technicalSeo.metaTitle.content}
                            </p>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Meta Description</span>
                          {auditResult.technicalSeo.metaDescription.exists ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        {auditResult.technicalSeo.metaDescription.exists && (
                          <div>
                            <p className="text-xs text-gray-600 mb-1">
                              Length: {auditResult.technicalSeo.metaDescription.length} characters
                            </p>
                            <p className="text-sm bg-gray-50 p-2 rounded">
                              {auditResult.technicalSeo.metaDescription.content}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Content Structure</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold">{auditResult.technicalSeo.headings.h1Count}</div>
                          <div className="text-xs text-gray-500">H1 Tags</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{auditResult.technicalSeo.headings.h2Count}</div>
                          <div className="text-xs text-gray-500">H2 Tags</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{auditResult.technicalSeo.headings.h3Count}</div>
                          <div className="text-xs text-gray-500">H3 Tags</div>
                        </div>
                      </div>
                      {auditResult.technicalSeo.headings.h1Text?.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">H1 Content:</p>
                          {auditResult.technicalSeo.headings.h1Text.map((h1, index) => (
                            <p key={index} className="text-sm bg-gray-50 p-2 rounded mb-1">
                              {h1}
                            </p>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Images & Links</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Images</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>Total: {auditResult.technicalSeo.images.total || 0}</div>
                          <div>Without Alt: {auditResult.technicalSeo.images.withoutAlt || 0}</div>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">Links</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>Internal: {auditResult.technicalSeo.links.internal || 0}</div>
                          <div>External: {auditResult.technicalSeo.links.external || 0}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Advanced SEO</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Schema Markup</span>
                        {auditResult.technicalSeo.schema?.exists ? (
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-xs text-gray-600">
                              {auditResult.technicalSeo.schema.types?.join(", ") || "Present"}
                            </span>
                          </div>
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      {auditResult.technicalSeo.openGraph && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Open Graph</span>
                          {auditResult.technicalSeo.openGraph.exists ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="swot" className="space-y-6">
                <SwotAnalysisComponent
                  auditId={auditResult._id}
                  initialSwot={auditResult.swotAnalysis}
                  onSwotGenerated={(swot) => {
                    setAuditResult({
                      ...auditResult,
                      swotAnalysis: swot,
                    })
                  }}
                />
              </TabsContent>

              <TabsContent value="opportunities" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>SEO Opportunities</CardTitle>
                    <CardDescription>Potential improvements and their estimated impact</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Generate opportunities based on audit results */}
                      {(auditResult.technicalSeo.images.withoutAlt || 0) > 0 && (
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">Optimize Image Alt Tags</h4>
                            <Badge>High Impact</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            Adding alt text to {auditResult.technicalSeo.images.withoutAlt || 0} images could improve
                            accessibility and SEO
                          </p>
                          <div className="flex items-center text-sm text-green-600">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            Estimated ranking improvement: +2-4 positions
                          </div>
                        </div>
                      )}

                      {auditResult.pageSpeedData.mobile.score < 80 && (
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">Improve Mobile Performance</h4>
                            <Badge variant="secondary">High Impact</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            Your mobile score is {auditResult.pageSpeedData.mobile.score}. Optimizing for mobile could
                            significantly improve rankings
                          </p>
                          <div className="flex items-center text-sm text-green-600">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            Estimated ranking improvement: +3-6 positions
                          </div>
                        </div>
                      )}

                      {!auditResult.technicalSeo.metaDescription.exists && (
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">Add Meta Description</h4>
                            <Badge variant="secondary">Medium Impact</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            Adding a compelling meta description could improve click-through rates from search results
                          </p>
                          <div className="flex items-center text-sm text-green-600">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            Estimated CTR improvement: +15-25%
                          </div>
                        </div>
                      )}

                      {!auditResult.technicalSeo.schema.exists && (
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">Add Structured Data</h4>
                            <Badge variant="outline">Medium Impact</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            Implementing schema markup could help search engines better understand your content
                          </p>
                          <div className="flex items-center text-sm text-green-600">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            Potential for rich snippets in search results
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AuditPage() {
  return (
    <ProtectedRoute requiredPlan="registered">
      <AuditPageContent />
    </ProtectedRoute>
  )
}
