"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Target, FileText, BarChart3 } from "lucide-react"
import { OptimizedContent } from "./optimized-content"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface OptimizationResult {
  optimizationId: string
  originalAnalysis: {
    wordCount: number
    sentenceCount: number
    keywordDensity: Array<{
      keyword: string
      density: number
      count: number
    }>
    readabilityScore: number
    seoScore: number
    avgWordsPerSentence: number
  }
  estimatedTime: string
}

function getScoreColor(score: number): string {
  if (score > 70) return "text-green-600"
  if (score > 50) return "text-yellow-600"
  return "text-red-600"
}

function getScoreLabel(score: number): string {
  if (score > 70) return "Good"
  if (score > 50) return "Average"
  return "Poor"
}

interface ContentAnalysisProps {
  analysis: {
    wordCount: number
    sentenceCount: number
    keywordDensity: Array<{
      keyword: string
      density: number
      count: number
    }>
    readabilityScore: number
    seoScore: number
    avgWordsPerSentence: number
  }
}

const ContentAnalysis = ({ analysis }: ContentAnalysisProps) => {
  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Content Analysis
        </CardTitle>
        <CardDescription>Detailed analysis of your content</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border">
            <div className={`text-2xl font-bold ${getScoreColor(analysis.seoScore)}`}>{analysis.seoScore}/100</div>
            <div className="text-sm text-gray-600">SEO Score</div>
            <Badge variant="outline" className="mt-1">
              {getScoreLabel(analysis.seoScore)}
            </Badge>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border">
            <div className={`text-2xl font-bold ${getScoreColor(analysis.readabilityScore)}`}>
              {analysis.readabilityScore}/100
            </div>
            <div className="text-sm text-gray-600">Readability</div>
            <Badge variant="outline" className="mt-1">
              {getScoreLabel(analysis.readabilityScore)}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 rounded-lg border">
            <div className="text-2xl font-bold">{analysis.wordCount}</div>
            <div className="text-sm text-gray-600">Word Count</div>
          </div>
          <div className="text-center p-4 rounded-lg border">
            <div className="text-2xl font-bold">{analysis.avgWordsPerSentence.toFixed(1)}</div>
            <div className="text-sm text-gray-600">Avg. Words/Sentence</div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Keyword Density</h3>
          <ul className="list-disc list-inside">
            {analysis.keywordDensity.map((item) => (
              <li key={item.keyword}>
                {item.keyword}: {item.density.toFixed(2)}% ({item.count} times)
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

export function ContentOptimizer() {
  const [content, setContent] = useState("")
  const [title, setTitle] = useState("")
  const [keywords, setKeywords] = useState<string[]>([""])
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null)
  const [error, setError] = useState("") // Corrected: Removed /*error,*/

  const addKeyword = () => {
    if (keywords.length < 5) {
      setKeywords([...keywords, ""])
    }
  }

  const updateKeyword = (index: number, value: string) => {
    const newKeywords = [...keywords]
    newKeywords[index] = value
    setKeywords(newKeywords)
  }

  const removeKeyword = (index: number) => {
    if (keywords.length > 1) {
      setKeywords(keywords.filter((_, i) => i !== index))
    }
  }

  const handleOptimize = async () => {
    setError("") // Reset error state

    // Validation
    if (content.length < 100) {
      toast.error("Content must be at least 100 characters long")
      return
    }

    const validKeywords = keywords.filter((k) => k.trim().length > 0)
    if (validKeywords.length === 0) {
      toast.error("Please provide at least one target keyword")
      return
    }

    setIsOptimizing(true)

    try {
      const response = await fetch("/api/content/optimize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Adjust based on your auth
        },
        body: JSON.stringify({
          content,
          title,
          targetKeywords: validKeywords,
        }),
      })

      if (!response.ok) {
        let errorBody: any
        try {
          // Attempt to parse as JSON first
          errorBody = await response.json()
        } catch (jsonError) {
          // If JSON parsing fails, read as text (likely HTML error page)
          errorBody = await response.text()
          console.error("Server returned non-JSON response (likely HTML error page):", errorBody)
          toast.error("A server error occurred. Please check the console for details (server returned HTML).")
          throw new Error("Server returned non-JSON response (likely HTML error page)")
        }

        let errorMessage = errorBody.message || "An unknown error occurred during optimization."

        if (errorBody.errors && Array.isArray(errorBody.errors)) {
          errorMessage += "\n" + errorBody.errors.map((err: any) => err.msg || err.message).join("\n")
        }
        toast.error(errorMessage)
        throw new Error(errorMessage) // Still throw for internal logging
      }

      const result = await response.json()
      setOptimizationResult(result.data)
    } catch (err) {
      // This catch block will now handle errors thrown by the `if (!response.ok)` block
      // and any other network errors. The specific error message is already toasted.
      if (err instanceof Error) {
        console.error("Optimization failed:", err.message)
      } else {
        console.error("Optimization failed:", err)
      }
      // Only show a generic toast if no specific error was already toasted
      if (!error) {
        // Check if error state was set by a specific message
        toast.error("Failed to optimize content. Please try again.")
      }
    } finally {
      setIsOptimizing(false)
    }
  }

  const wordCount = content.split(/\s+/).filter((word) => word.length > 0).length
  const isContentValid = content.length >= 100 && content.length <= 10000
  const validKeywords = keywords.filter((k) => k.trim().length > 0)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Input Section */}
      <div className="space-y-6">
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Content Input
            </CardTitle>
            <CardDescription>Enter your content and target keywords for SEO optimization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title (Optional)</Label>
              <Input
                id="title"
                placeholder="Enter your content title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
              />
            </div>

            <div>
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                placeholder="Paste your article, blog post, or content here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[300px] resize-none"
                maxLength={10000}
              />
              <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                <span>
                  {wordCount} words • {content.length} characters
                </span>
                <span className={isContentValid ? "text-green-600" : "text-red-600"}>
                  {content.length < 100
                    ? `${100 - content.length} more characters needed`
                    : content.length > 10000
                      ? `${content.length - 10000} characters over limit`
                      : "Valid length"}
                </span>
              </div>
            </div>

            <div>
              <Label>Target Keywords * (1-5 keywords)</Label>
              <div className="space-y-2 mt-2">
                {keywords.map((keyword, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`Keyword ${index + 1}${index === 0 ? " (Primary)" : ""}`}
                      value={keyword}
                      onChange={(e) => updateKeyword(index, e.target.value)}
                      maxLength={50}
                    />
                    {keywords.length > 1 && (
                      <Button type="button" variant="outline" size="sm" onClick={() => removeKeyword(index)}>
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                {keywords.length < 5 && (
                  <Button type="button" variant="outline" size="sm" onClick={addKeyword}>
                    Add Keyword
                  </Button>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">{validKeywords.length}/5 keywords added</p>
            </div>

            <Button
              onClick={handleOptimize}
              disabled={isOptimizing || !isContentValid || validKeywords.length === 0}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              size="lg"
            >
              {isOptimizing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Optimizing Content...
                </>
              ) : (
                <>
                  <Target className="mr-2 h-4 w-4" />
                  Optimize Content
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Section */}
      <div className="space-y-6">
        {optimizationResult ? (
          <>
            <ContentAnalysis analysis={optimizationResult.originalAnalysis} />
            <OptimizedContent optimizationId={optimizationResult.optimizationId} />
          </>
        ) : (
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Content Analysis
              </CardTitle>
              <CardDescription>Your content analysis will appear here after optimization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Enter your content and click "Optimize Content" to see detailed analysis</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
