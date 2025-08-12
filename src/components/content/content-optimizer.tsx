"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, FileText, BarChart3, Plus, X, Sparkles, RefreshCw } from "lucide-react"
import { OptimizedContent } from "./optimized-content"
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
  if (score >= 80) return "text-green-600"
  if (score >= 60) return "text-yellow-600"
  return "text-red-600"
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Excellent"
  if (score >= 60) return "Good"
  if (score >= 40) return "Fair"
  return "Needs Improvement"
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
          Original Content Analysis
        </CardTitle>
        <CardDescription>Analysis of your original content before optimization</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border">
            <div className={`text-2xl font-bold ${getScoreColor(analysis.seoScore)}`}>{analysis.seoScore}/100</div>
            <div className="text-sm text-gray-600">Current SEO Score</div>
            <Badge variant="outline" className="mt-1">
              {getScoreLabel(analysis.seoScore)}
            </Badge>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border">
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
            <div className="text-2xl font-bold">{analysis.avgWordsPerSentence}</div>
            <div className="text-sm text-gray-600">Avg. Words/Sentence</div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Current Keyword Density</h3>
          <div className="space-y-2">
            {analysis.keywordDensity.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="font-medium">{item.keyword}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{item.count} times</span>
                  <Badge variant={item.density >= 0.5 && item.density <= 2.5 ? "default" : "secondary"}>
                    {item.density}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <Sparkles className="h-4 w-4 inline mr-1" />
            Your content will be completely rewritten and optimized for better SEO performance while maintaining the
            original meaning.
          </p>
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
        },
        body: JSON.stringify({
          content,
          title,
          targetKeywords: validKeywords,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Server error occurred" }))
        toast.error(errorData.message || "Failed to start content regeneration")
        return
      }

      const result = await response.json()
      setOptimizationResult(result.data)
      toast.success("Content regeneration started! Your content is being completely rewritten with SEO optimization.")
    } catch (error) {
      console.error("Optimization failed:", error)
      toast.error("Failed to start content regeneration. Please try again.")
    } finally {
      setIsOptimizing(false)
    }
  }

  const resetForm = () => {
    setContent("")
    setTitle("")
    setKeywords([""])
    setOptimizationResult(null)
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
            <CardDescription>
              Enter your content and target keywords. We'll completely rewrite it with SEO optimization.
            </CardDescription>
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
              <Label htmlFor="content">Original Content *</Label>
              <Textarea
                id="content"
                placeholder="Paste your article, blog post, or content here. We'll rewrite it with SEO optimization while keeping the original meaning..."
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
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {keywords.length < 5 && (
                  <Button type="button" variant="outline" size="sm" onClick={addKeyword}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Keyword
                  </Button>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">{validKeywords.length}/5 keywords added</p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleOptimize}
                disabled={isOptimizing || !isContentValid || validKeywords.length === 0}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                size="lg"
              >
                {isOptimizing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Regenerating Content...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerate with SEO
                  </>
                )}
              </Button>

              {optimizationResult && (
                <Button
                  onClick={resetForm}
                  variant="outline"
                  size="lg"
                  className="border-blue-200 hover:bg-blue-50 bg-transparent"
                >
                  New Content
                </Button>
              )}
            </div>

            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                What happens next?
              </h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Your content will be completely rewritten</li>
                <li>• Keywords will be naturally integrated</li>
                <li>• SEO structure will be optimized</li>
                <li>• Original meaning will be preserved</li>
                <li>• Readability will be improved</li>
              </ul>
            </div>
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
              <CardDescription>Your content analysis will appear here after regeneration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <RefreshCw className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium mb-2">Ready to Transform Your Content?</p>
                <p className="text-sm">
                  Enter your content and keywords to get a completely rewritten, SEO-optimized version
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
