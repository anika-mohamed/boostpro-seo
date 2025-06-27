"use client"

import { useState } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { seoApi } from "@/lib/api/seo"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { FileText, Download, ArrowLeft, TrendingUp, BarChart3, Calendar, Target, CheckCircle } from 'lucide-react'
import Link from "next/link"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

interface AuditSummary {
  _id: string
  url: string
  domain: string
  overallScore: number
  status: string
  createdAt: string
}

interface ReportData {
  user: any
  audits: AuditSummary[]
  reportType: string
  generatedAt: string
  summary: {
    totalAudits: number
    avgScore: number
    issuesByCategory: {
      critical: number
      warning: number
      info: number
    }
    topIssues: string[]
    recommendations: string[]
  }
}

function ReportsPageContent() {
  const [selectedAudits, setSelectedAudits] = useState<string[]>([])
  const [reportType, setReportType] = useState<"summary" | "comprehensive">("comprehensive")
  const [generatedReport, setGeneratedReport] = useState<ReportData | null>(null)

  const { data: auditHistory, isLoading: loadingAudits } = useQuery({
    queryKey: ["audits"],
    queryFn: seoApi.getAuditHistory,
  })

  const generateReportMutation = useMutation({
    mutationFn: ({ auditIds, reportType }: { auditIds: string[]; reportType: string }) =>
      seoApi.generateReport(auditIds, reportType),
    onSuccess: (data) => {
      setGeneratedReport(data.data)
      toast.success("Report generated successfully!")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to generate report")
    },
  })

  const downloadReportMutation = useMutation({
    mutationFn: (reportId: string) => seoApi.downloadReport(reportId),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `seo-report-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success("Report downloaded successfully!")
    },
    onError: () => {
      toast.error("Failed to download report")
    },
  })

  const audits = auditHistory?.data || []

  const handleAuditSelection = (auditId: string, checked: boolean) => {
    if (checked) {
      setSelectedAudits([...selectedAudits, auditId])
    } else {
      setSelectedAudits(selectedAudits.filter(id => id !== auditId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAudits(audits.map((audit: AuditSummary) => audit._id))
    } else {
      setSelectedAudits([])
    }
  }

  const handleGenerateReport = () => {
    if (selectedAudits.length === 0) {
      toast.error("Please select at least one audit")
      return
    }
    generateReportMutation.mutate({ auditIds: selectedAudits, reportType })
  }

  // Generate mock historical data for progress tracking
  const generateHistoricalData = () => {
    const data = []
    const now = new Date()
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const baseScore = 65 + Math.random() * 20
      data.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        score: Math.round(baseScore + (11 - i) * 2), // Gradual improvement
        audits: Math.floor(Math.random() * 5) + 1,
        issues: Math.floor(Math.random() * 10) + 5
      })
    }
    return data
  }

  const historicalData = generateHistoricalData()

  // Generate ranking prediction data
  const generateRankingPrediction = () => {
    const currentScore = audits.length > 0 ? audits[0]?.overallScore || 70 : 70
    const predictions = []
    
    for (let i = 0; i <= 6; i++) {
      const improvement = i * 5
      const newScore = Math.min(100, currentScore + improvement)
      const estimatedRanking = Math.max(1, Math.round(50 - (newScore - 50) * 0.8))
      
      predictions.push({
        month: `Month ${i}`,
        score: newScore,
        estimatedRanking,
        traffic: Math.round(1000 + (newScore - currentScore) * 50)
      })
    }
    
    return predictions
  }

  const rankingPredictions = generateRankingPrediction()

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
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Reports & Progress Tracking</h1>
              <p className="text-gray-600">Generate reports and track your SEO progress over time</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        <Tabs defaultValue="progress" className="space-y-6">
          <TabsList>
            <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
            <TabsTrigger value="predictions">Ranking Predictions</TabsTrigger>
            <TabsTrigger value="reports">Generate Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="progress" className="space-y-6">
            {/* Progress Overview */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <CardTitle>SEO Score Trend</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">
                    {historicalData[historicalData.length - 1]?.score || 0}
                  </div>
                  <div className="text-sm text-green-600">
                    +{((historicalData[historicalData.length - 1]?.score || 0) - (historicalData[0]?.score || 0))} from last year
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <CardTitle>Total Audits</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">{audits.length}</div>
                  <div className="text-sm text-gray-600">Websites analyzed</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    <CardTitle>Issues Resolved</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">
                    {historicalData.reduce((sum, month) => sum + month.issues, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total issues identified</div>
                </CardContent>
              </Card>
            </div>

            {/* Historical Charts */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>SEO Score Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={historicalData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Area 
                          type="monotone" 
                          dataKey="score" 
                          stroke="#3b82f6" 
                          fill="#3b82f6" 
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Audit Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={historicalData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="audits" 
                          stroke="#10b981" 
                          strokeWidth={2}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="issues" 
                          stroke="#f59e0b" 
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent SEO Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {audits.slice(0, 5).map((audit: AuditSummary) => (
                    <div key={audit._id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="font-medium">{audit.url}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(audit.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{audit.overallScore}/100</div>
                        <Badge variant={audit.status === "completed" ? "default" : "secondary"}>
                          {audit.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="predictions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ranking Prediction Model</CardTitle>
                <p className="text-sm text-gray-600">
                  Estimated impact of implementing SEO improvements over the next 6 months
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={rankingPredictions}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" domain={[0, 100]} />
                      <YAxis yAxisId="right" orientation="right" domain={[1, 50]} reversed />
                      <Tooltip />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="score" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        name="SEO Score"
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="estimatedRanking" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        name="Estimated Ranking"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Current Position</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">
                    #{rankingPredictions[0]?.estimatedRanking || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600">Average ranking</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>6-Month Projection</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2 text-green-600">
                    #{rankingPredictions[rankingPredictions.length - 1]?.estimatedRanking || 'N/A'}
                  </div>
                  <div className="text-sm text-green-600">
                    +{(rankingPredictions[0]?.estimatedRanking || 0) - (rankingPredictions[rankingPredictions.length - 1]?.estimatedRanking || 0)} positions
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Traffic Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2 text-purple-600">
                    +{((rankingPredictions[rankingPredictions.length - 1]?.traffic || 0) - (rankingPredictions[0]?.traffic || 0)).toLocaleString()}
                  </div>
                  <div className="text-sm text-purple-600">Estimated monthly visitors</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Improvement Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <h4 className="font-medium text-blue-800">Month 1-2: Technical Optimization</h4>
                    <p className="text-sm text-blue-600">Focus on page speed, mobile optimization, and fixing technical issues</p>
                  </div>
                  <div className="p-3 bg-green-50 border border-green-200 rounded">
                    <h4 className="font-medium text-green-800">Month 3-4: Content Enhancement</h4>
                    <p className="text-sm text-green-600">Optimize existing content and create new keyword-targeted pages</p>
                  </div>
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded">
                    <h4 className="font-medium text-purple-800">Month 5-6: Authority Building</h4>
                    <p className="text-sm text-purple-600">Focus on link building and establishing topical authority</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            {!generatedReport ? (
              <>
                {/* Report Configuration */}
                <Card>
                  <CardHeader>
                    <CardTitle>Generate SEO Report</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Report Type Selection */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Report Type</label>
                      <div className="flex space-x-4">
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            value="summary"
                            checked={reportType === "summary"}
                            onChange={(e) => setReportType(e.target.value as "summary")}
                          />
                          <span>Summary Report</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            value="comprehensive"
                            checked={reportType === "comprehensive"}
                            onChange={(e) => setReportType(e.target.value as "comprehensive")}
                          />
                          <span>Comprehensive Report</span>
                        </label>
                      </div>
                    </div>

                    {/* Audit Selection */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-medium">Select Audits to Include</label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSelectAll(selectedAudits.length !== audits.length)}
                        >
                          {selectedAudits.length === audits.length ? "Deselect All" : "Select All"}
                        </Button>
                      </div>
                      
                      {loadingAudits ? (
                        <div className="space-y-2">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="animate-pulse h-12 bg-gray-200 rounded"></div>
                          ))}
                        </div>
                      ) : audits.length > 0 ? (
                        <div className="max-h-64 overflow-y-auto space-y-2">
                          {audits.map((audit: AuditSummary) => (
                            <div key={audit._id} className="flex items-center space-x-3 p-3 border rounded">
                              <Checkbox
                                checked={selectedAudits.includes(audit._id)}
                                onCheckedChange={(checked) => handleAuditSelection(audit._id, checked as boolean)}
                              />
                              <div className="flex-1">
                                <p className="font-medium">{audit.url}</p>
                                <p className="text-sm text-gray-500">
                                  {new Date(audit.createdAt).toLocaleDateString()} • Score: {audit.overallScore}/100
                                </p>
                              </div>
                              <Badge variant={audit.status === "completed" ? "default" : "secondary"}>
                                {audit.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">
                          No audits available. <Link href="/audit" className="text-blue-600 hover:underline">Run your first audit</Link>
                        </p>
                      )}
                    </div>

                    {/* Generate Button */}
                    <Button
                      onClick={handleGenerateReport}
                      disabled={selectedAudits.length === 0 || generateReportMutation.isPending}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600"
                    >
                      {generateReportMutation.isPending ? "Generating Report..." : "Generate Report"}
                    </Button>
                  </CardContent>
                </Card>
              </>
            ) : (
              /* Generated Report Display */
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>SEO Report Generated</CardTitle>
                        <p className="text-sm text-gray-600">
                          {generatedReport.reportType} report for {generatedReport.audits.length} audit(s)
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => downloadReportMutation.mutate("mock-report-id")}
                          disabled={downloadReportMutation.isPending}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          {downloadReportMutation.isPending ? "Downloading..." : "Download PDF"}
                        </Button>
                        <Button variant="outline" onClick={() => setGeneratedReport(null)}>
                          Generate New Report
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Report Summary */}
                    <div className="grid gap-4 md:grid-cols-4 mb-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{generatedReport.summary.totalAudits}</div>
                        <div className="text-sm text-gray-500">Total Audits</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{generatedReport.summary.avgScore}</div>
                        <div className="text-sm text-gray-500">Average Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {generatedReport.summary.issuesByCategory.critical}
                        </div>
                        <div className="text-sm text-gray-500">Critical Issues</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                          {generatedReport.summary.issuesByCategory.warning}
                        </div>
                        <div className="text-sm text-gray-500">Warnings</div>
                      </div>
                    </div>

                    {/* Top Issues */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3">Top Issues Found</h3>
                      <div className="space-y-2">
                        {generatedReport.summary.topIssues.map((issue, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <span className="text-red-500">•</span>
                            <span className="text-sm">{issue}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Key Recommendations</h3>
                      <div className="space-y-2">
                        {generatedReport.summary.recommendations.map((rec, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Detailed Audit Results */}
                <Card>
                  <CardHeader>
                    <CardTitle>Detailed Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {generatedReport.audits.map((audit, index) => (
                        <div key={audit._id} className="border rounded p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{audit.url}</h4>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold">{audit.overallScore}/100</span>
                              <Progress value={audit.overallScore} className="w-20 h-2" />
                            </div>
                          </div>
                          <p className="text-sm text-gray-500">
                            Audited on {new Date(audit.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function ReportsPage() {
  return (
    <ProtectedRoute requiredPlan="basic">
      <ReportsPageContent />
    </ProtectedRoute>
  )
}