"use client"

import { useState, useEffect } from "react"
import { useMutation } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Brain,
  RefreshCw,
  Download,
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
      console.log("SWOT API Response:", data) // optional debug
      const newSwot = {
        strengths: data.strengths || [],
        weaknesses: data.weaknesses || [],
        opportunities: data.opportunities || [],
        threats: data.threats || [],
        generatedBy: data.generatedBy || "rules",
        createdAt: data.createdAt || new Date().toISOString(),
      }
      setSwotAnalysis(newSwot)
      onSwotGenerated?.(newSwot)
      toast.success("AI SWOT analysis generated successfully!")
    },
    onError: (error: any) => {
      console.error("SWOT generation error:", error.response?.data || error)
      toast.error(error.response?.data?.message || "Failed to generate SWOT analysis")
    },
  })

  useEffect(() => {
    if (!swotAnalysis && !generateSwotMutation.isPending) {
      generateSwotMutation.mutate()
    }
  }, [])

  const handleGenerateSwot = () => {
    console.log("Generating SWOT...")
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

  const renderListOrEmpty = (
    items: string[] | undefined,
    icon: JSX.Element,
    textClass: string
  ) =>
    Array.isArray(items) && items.length > 0 ? (
      items.map((item, i) => (
        <li key={i} className="flex items-start space-x-3">
          {icon}
          <span className={`text-sm ${textClass}`}>{item}</span>
        </li>
      ))
    ) : (
      <li className="text-sm text-gray-500">No data available.</li>
    )

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
            {generateSwotMutation.isPending ? (
              <>
                <RefreshCw className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Generating SWOT analysis...</p>
              </>
            ) : (
              <>
                <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Generate AI SWOT Analysis</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Our AI will analyze your audit results and provide strategic insights including strengths, weaknesses,
                  opportunities, and threats for your SEO strategy.
                </p>
                <Button
                  onClick={handleGenerateSwot}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Generate AI SWOT Analysis
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
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
            {renderListOrEmpty(
              swotAnalysis.strengths,
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />,
              "text-green-700"
            )}
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
              <CardDescription className="text-red-600">Areas needing improvement</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {renderListOrEmpty(
              swotAnalysis.weaknesses,
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />,
              "text-red-700"
            )}
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
              <CardDescription className="text-blue-600">Potential for growth</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {renderListOrEmpty(
              swotAnalysis.opportunities,
              <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />,
              "text-blue-700"
            )}
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
              <CardDescription className="text-yellow-600">External risks to monitor</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {renderListOrEmpty(
              swotAnalysis.threats,
              <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />,
              "text-yellow-700"
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
