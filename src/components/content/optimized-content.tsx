"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Sparkles, Copy, CheckCircle, TrendingUp, Lightbulb, Hash, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"

interface OptimizedContentProps {
  optimizationId: string
}

interface OptimizationData {
  originalContent: {
    title: string
    content: string
    wordCount: number
  }
  optimizedContent: {
    title: string
    content: string
    wordCount: number
    keywordDensity: Array<{
      keyword: string
      density: number
      count: number
    }>
    readabilityScore: number
    seoScore: number
  }
  suggestions: Array<{
    type: string
    suggestion: string
    applied: boolean
  }>
  metadata: {
    suggestedTitle: string
    suggestedDescription: string
    suggestedSlug: string
    suggestedTags: string[]
  }
  performance: {
    beforeScore: number
    afterScore: number
    improvement: number
  }
  status: string
  errorMessage?: string
}

export function OptimizedContent({ optimizationId }: OptimizedContentProps) {
  const [data, setData] = useState<OptimizationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let pollInterval: NodeJS.Timeout

    const fetchOptimization = async () => {
      try {
        const response = await fetch(`/api/content/${optimizationId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch optimization results")
        }

        const result = await response.json()
        const optimizationData = result.data

        setData(optimizationData)

        // Stop polling if optimization is completed or failed
        if (optimizationData.status === "completed" || optimizationData.status === "failed") {
          if (pollInterval) {
            clearInterval(pollInterval)
          }
          setLoading(false)
        }
      } catch (err) {
        setError("Failed to load optimization results")
        console.error(err)
        setLoading(false)
        if (pollInterval) {
          clearInterval(pollInterval)
        }
      }
    }

    // Initial fetch
    fetchOptimization()

    // Poll for results every 3 seconds until completion
    pollInterval = setInterval(fetchOptimization, 3000)

    // Cleanup interval on component unmount
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval)
      }
    }
  }, [optimizationId])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success("Content copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text:", err)
      toast.error("Failed to copy content")
    }
  }

  if (loading || (data && data.status === "processing")) {
    return (
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Optimization Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Optimizing your content...</p>
            <p className="text-sm text-gray-500 mt-2">This usually takes 1-2 minutes</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error || "Failed to load optimization results"}</AlertDescription>
      </Alert>
    )
  }

  if (data.status === "failed") {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Optimization failed: {data.errorMessage || "Unknown error occurred"}</AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Optimization Results
        </CardTitle>
        <CardDescription>Your content has been optimized for better SEO performance</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Performance Improvement */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span className="font-semibold">SEO Score Improvement</span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                +{data.performance.improvement}
              </div>
              <div className="text-sm text-gray-600">
                {data.performance.beforeScore} → {data.performance.afterScore}
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
            <TabsTrigger value="content">Optimized Content</TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
            <TabsTrigger value="comparison">Before/After</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Optimized Content</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(data.optimizedContent.content)}
                className="border-blue-200 hover:bg-blue-50"
              >
                {copied ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Content
                  </>
                )}
              </Button>
            </div>

            {data.optimizedContent.title && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-lg mb-2">{data.optimizedContent.title}</h4>
              </div>
            )}

            <div className="p-4 border rounded-lg bg-white max-h-96 overflow-y-auto">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{data.optimizedContent.content}</div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded border">
                <div className="font-semibold">{data.optimizedContent.wordCount}</div>
                <div className="text-gray-600">Words</div>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded border">
                <div className="font-semibold">{data.optimizedContent.readabilityScore}/100</div>
                <div className="text-gray-600">Readability</div>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded border">
                <div className="font-semibold">{data.optimizedContent.seoScore}/100</div>
                <div className="text-gray-600">SEO Score</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Optimization Suggestions
            </h3>
            <div className="space-y-3">
              {data.suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className={`mt-1 ${suggestion.applied ? "text-green-600" : "text-gray-400"}`}>
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {suggestion.type}
                      </Badge>
                      {suggestion.applied && (
                        <Badge variant="default" className="text-xs">
                          Applied
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm">{suggestion.suggestion}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="metadata" className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Hash className="h-5 w-5" />
              SEO Metadata
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Suggested Title</label>
                <div className="p-3 bg-gray-50 rounded border mt-1">{data.metadata.suggestedTitle}</div>
              </div>

              <div>
                <label className="text-sm font-medium">Meta Description</label>
                <div className="p-3 bg-gray-50 rounded border mt-1">{data.metadata.suggestedDescription}</div>
              </div>

              <div>
                <label className="text-sm font-medium">URL Slug</label>
                <div className="p-3 bg-gray-50 rounded border mt-1 font-mono text-sm">
                  /{data.metadata.suggestedSlug}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Suggested Tags</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {data.metadata.suggestedTags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-4">
            <h3 className="text-lg font-semibold">Before vs After Comparison</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2 text-red-600">Original Content</h4>
                <div className="p-4 border rounded-lg bg-red-50 max-h-64 overflow-y-auto">
                  <div className="text-sm whitespace-pre-wrap">
                    {data.originalContent.content.substring(0, 500)}
                    {data.originalContent.content.length > 500 && "..."}
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-600">SEO Score: {data.performance.beforeScore}/100</div>
              </div>

              <div>
                <h4 className="font-medium mb-2 text-green-600">Optimized Content</h4>
                <div className="p-4 border rounded-lg bg-green-50 max-h-64 overflow-y-auto">
                  <div className="text-sm whitespace-pre-wrap">
                    {data.optimizedContent.content.substring(0, 500)}
                    {data.optimizedContent.content.length > 500 && "..."}
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-600">SEO Score: {data.performance.afterScore}/100</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
