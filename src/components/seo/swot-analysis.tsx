"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Brain,
  RefreshCw,
  Download,
  Lightbulb,
  Shield,
  Target,
  AlertTriangle,
} from "lucide-react"
import { seoApi } from "@/lib/api/seo"
import { toast } from "sonner"

interface SwotAnalysis {
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  threats: string[]
  generatedBy: "ai" | "rules"
  createdAt?: string
}

interface SwotAnalysisProps {
  auditId: string
  initialSwot?: SwotAnalysis
  onSwotGenerated?: (swot: SwotAnalysis) => void
}

export function SwotAnalysisComponent({ auditId, initialSwot, onSwotGenerated }: SwotAnalysisProps) {
  const [swotAnalysis, setSwotAnalysis] = useState<SwotAnalysis | null>(initialSwot || null)

  const generateSwotMutation = useMutation({
    mutationFn: () => seoApi.generateSwotAnalysis(auditId),
    onSuccess: (data) => {
      const newSwot = data.data
      setSwotAnalysis(newSwot)
      onSwotGenerated?.(newSwot)
      toast.success("AI SWOT analysis generated successfully!")
    },
    onError: (error: any) => {
      console.error("SWOT generation error:", error)
      toast.error(error.response?.data?.message || "Failed to generate SWOT analysis")
    },
  })

  const handleGenerateSwot = () => {
    generateSwotMutation.mutate()
  }

  const handleDownloadSwot = () => {
    if (!swotAnalysis) return

    const swotText = `
SWOT ANALYSIS REPORT
Generated: ${new Date().toLocaleDateString()}
Analysis Type: ${swotAnalysis.generatedBy === "ai" ? "AI-Powered" : "Rule-Based"}

STRENGTHS:
${swotAnalysis.strengths.map((s, i) => `${i + 1}. ${s}`).join("\n")}

WEAKNESSES:
${swotAnalysis.weaknesses.map((w, i) => `${i + 1}. ${w}`).join("\n")}

OPPORTUNITIES:
${swotAnalysis.opportunities.map((o, i) => `${i + 1}. ${o}`).join("\n")}

THREATS:
${swotAnalysis.threats.map((t, i) => `${i + 1}. ${t}`).join("\n")}
    `.trim()

    const blob = new Blob([swotText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `swot-analysis-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!swotAnalysis) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <div>
                <CardTitle>AI-Powered SWOT Analysis</CardTitle>
                <CardDescription>
                  Get strategic insights about your website's SEO performance using artificial intelligence
                </CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              Premium Feature
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Generate AI SWOT Analysis</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Our AI will analyze your audit results and provide strategic insights including strengths, weaknesses,
              opportunities, and threats for your SEO strategy.
            </p>
            <Button
              onClick={handleGenerateSwot}
              disabled={generateSwotMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {generateSwotMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating Analysis...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Generate AI SWOT Analysis
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <div>
                <CardTitle>{swotAnalysis.generatedBy === "ai" ? "AI-Powered" : "Rule-Based"} SWOT Analysis</CardTitle>
                <CardDescription>
                  Strategic insights for your website's SEO performance
                  {swotAnalysis.createdAt && (
                    <span className="ml-2">• Generated {new Date(swotAnalysis.createdAt).toLocaleDateString()}</span>
                  )}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge
                variant={swotAnalysis.generatedBy === "ai" ? "default" : "secondary"}
                className={swotAnalysis.generatedBy === "ai" ? "bg-purple-600" : ""}
              >
                {swotAnalysis.generatedBy === "ai" ? "AI Generated" : "Rule Based"}
              </Badge>
              <Button variant="outline" size="sm" onClick={handleDownloadSwot}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateSwot}
                disabled={generateSwotMutation.isPending}
              >
                {generateSwotMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Regenerate
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* SWOT Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Strengths */}
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-green-800">Strengths</CardTitle>
                <CardDescription className="text-green-600">What your website does well</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {swotAnalysis.strengths.map((strength, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-green-700">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Weaknesses */}
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <CardTitle className="text-red-800">Weaknesses</CardTitle>
                <CardDescription className="text-red-600">Areas that need improvement</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {swotAnalysis.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-red-700">{weakness}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Opportunities */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-blue-800">Opportunities</CardTitle>
                <CardDescription className="text-blue-600">Potential for growth and improvement</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {swotAnalysis.opportunities.map((opportunity, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-blue-700">{opportunity}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Threats */}
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <CardTitle className="text-yellow-800">Threats</CardTitle>
                <CardDescription className="text-yellow-600">External challenges and risks</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {swotAnalysis.threats.map((threat, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-yellow-700">{threat}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Strategic Recommendations */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-amber-600" />
            <div>
              <CardTitle>Strategic Recommendations</CardTitle>
              <CardDescription>Action items based on your SWOT analysis</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="immediate" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="immediate">Immediate Actions</TabsTrigger>
              <TabsTrigger value="shortterm">Short Term</TabsTrigger>
              <TabsTrigger value="longterm">Long Term</TabsTrigger>
            </TabsList>

            <TabsContent value="immediate" className="space-y-4">
              <div className="space-y-3">
                {swotAnalysis.weaknesses.slice(0, 3).map((weakness, index) => (
                  <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-800">Address: {weakness}</p>
                        <p className="text-xs text-red-600 mt-1">
                          Priority: High - This directly impacts your SEO performance
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="shortterm" className="space-y-4">
              <div className="space-y-3">
                {swotAnalysis.opportunities.slice(0, 3).map((opportunity, index) => (
                  <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Target className="h-4 w-4 text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">Pursue: {opportunity}</p>
                        <p className="text-xs text-blue-600 mt-1">
                          Timeline: 1-3 months - Moderate effort, good ROI potential
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="longterm" className="space-y-4">
              <div className="space-y-3">
                {swotAnalysis.strengths.slice(0, 2).map((strength, index) => (
                  <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Shield className="h-4 w-4 text-green-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-green-800">Leverage: {strength}</p>
                        <p className="text-xs text-green-600 mt-1">
                          Strategy: Build upon this strength for competitive advantage
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {swotAnalysis.threats.slice(0, 2).map((threat, index) => (
                  <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">Monitor: {threat}</p>
                        <p className="text-xs text-yellow-600 mt-1">
                          Strategy: Develop contingency plans and monitoring systems
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
