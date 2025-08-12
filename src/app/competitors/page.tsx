"use client"

import { useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { seoApi } from "@/lib/api/seo"
import { useSeoQueries } from "@/lib/hooks/use-seo-queries"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { Users, ArrowLeft, Plus, X, Loader2, Download } from "lucide-react"
import { AxiosError } from "axios"

// ====================================================================
//  TYPE DEFINITIONS & CONSTANTS
// ====================================================================

const ANALYSIS_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

type AnalysisStatus = typeof ANALYSIS_STATUS[keyof typeof ANALYSIS_STATUS];

interface Competitor {
  _id: string;
  url: string;
  domain: string;
  technicalScore: number;
  contentLength: number;
}

interface AnalysisResult {
  _id: string;
  status: AnalysisStatus;
  keywords: string[];
  summary: {
    totalCompetitors: number;
    avgCompetitorScore: number;
  };
  analysis: {
      gapAnalysis: any[];
      opportunities: any[];
  };
  competitors: Competitor[];
  userWebsite?: string;
  createdAt: string;
}

interface ApiResponse<T> {
    success: boolean;
    data: T;
}

interface CompetitorResultPageProps {
  analysisId: string;
  onBack: () => void;
}

interface CompetitorStartContentProps {
  onAnalysisStart: (id: string) => void;
}

/**
 * Displays the results of a single analysis, polling for completion.
 */
function CompetitorResultPage({ analysisId, onBack }: CompetitorResultPageProps) {
  const { data: result, isLoading, isError } = useQuery({
    queryKey: ["competitorAnalysis", analysisId],
    queryFn: () => seoApi.getCompetitorAnalysisById(analysisId),
    enabled: !!analysisId,
    refetchInterval: (query: any) => {
      if (query.state.data?.data?.status === ANALYSIS_STATUS.PENDING) {
        return 5000; // Poll every 5 seconds if pending
      }
      return false; // Stop polling if completed, failed, or on error
    },
  });

  const analysisResult = result?.data;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <p className="mt-4 text-lg">Loading Analysis Report...</p>
      </div>
    );
  }
  
  if (isError || !analysisResult) {
    return (
      <Card>
        <CardHeader><CardTitle>Error</CardTitle></CardHeader>
        <CardContent>
          <p>Could not load the analysis report. Please try again later.</p>
          <Button onClick={onBack} variant="outline" className="mt-4">Go Back</Button>
        </CardContent>
      </Card>
    )
  }

  if (analysisResult.status === ANALYSIS_STATUS.PENDING) {
    return (
      <Card>
        <CardHeader><CardTitle>Analysis in Progress</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p>Your analysis for keywords: <span className="font-semibold">{analysisResult.keywords.join(", ")}</span> is running.</p>
          <Progress value={50} />
          <p className="text-sm text-center text-gray-500">Please wait, this can take several minutes...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
          <Button onClick={onBack} variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Analyses
          </Button>

          <a
            href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/competitors/analysis/${analysisId}/download`}
            download
          >
            <Button variant="default" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download PDF
            </Button>
          </a>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Analysis Summary</CardTitle>
          <CardDescription>Keywords: {analysisResult.keywords.join(", ")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4 text-center">
            <div>
              <div className="text-2xl font-bold">{analysisResult.summary?.totalCompetitors || 0}</div>
              <p className="text-sm text-gray-500">Competitors Found</p>
            </div>
            <div>
              <div className="text-2xl font-bold">{analysisResult.summary?.avgCompetitorScore || 0}</div>
              <p className="text-sm text-gray-500">Avg. Technical Score</p>
            </div>
            <div>
              <div className="text-2xl font-bold">{analysisResult.analysis?.gapAnalysis?.length || 0}</div>
              <p className="text-sm text-gray-500">Keyword Gaps</p>
            </div>
            <div>
              <div className="text-2xl font-bold">{analysisResult.analysis?.opportunities?.length || 0}</div>
              <p className="text-sm text-gray-500">Opportunities</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Competitor Details</CardTitle></CardHeader>
        <CardContent>
            <Table>
                <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Domain</TableHead><TableHead>Score</TableHead><TableHead>Words</TableHead></TableRow></TableHeader>
                <TableBody>
                    {analysisResult.competitors?.map((comp: Competitor, index: number) => (
                        <TableRow key={comp._id || index}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell><a href={comp.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{comp.domain}</a></TableCell>
                            <TableCell><Badge variant={comp.technicalScore > 80 ? "default" : "destructive"}>{comp.technicalScore}</Badge></TableCell>
                            <TableCell>{comp.contentLength}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
       </Card>
    </div>
  )
}

/**
 * Renders the form for starting a new competitor analysis.
 */
function CompetitorStartContent({ onAnalysisStart }: CompetitorStartContentProps) {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [currentKeyword, setCurrentKeyword] = useState("");
  const [userWebsite, setUserWebsite] = useState("");

  const startAnalysisMutation = useMutation({
    mutationFn: (variables: { keywords: string[]; userWebsite?: string }) =>
      seoApi.analyzeCompetitors(variables.keywords, variables.userWebsite),
    onSuccess: (response: ApiResponse<{ analysisId: string }>) => {
      toast.success("Competitor analysis started successfully!");
      onAnalysisStart(response.data.analysisId);
    },
    onError: (err: AxiosError<{ message: string }>) => {
      toast.error(err.response?.data?.message || "Failed to start analysis");
    },
  });

  const addKeyword = () => {
    if (currentKeyword.trim() && keywords.length < 3 && !keywords.includes(currentKeyword.trim())) {
      setKeywords([...keywords, currentKeyword.trim()]);
      setCurrentKeyword("");
    }
  };

  const removeKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  const handleAnalysis = () => {
    if (keywords.length === 0) {
      toast.error("Please add at least one keyword");
      return;
    }
    startAnalysisMutation.mutate({ keywords, userWebsite: userWebsite || undefined });
  };

  return (
    <Card>
      <CardHeader><CardTitle>Setup New Competitor Analysis</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Target Keywords (Max 3)</label>
          <div className="flex gap-2 mb-3">
            <Input placeholder="e.g., 'digital marketing'" value={currentKeyword} onChange={(e) => setCurrentKeyword(e.target.value)} onKeyPress={(e) => e.key === "Enter" && addKeyword()} disabled={keywords.length >= 3 || startAnalysisMutation.isPending} />
            <Button onClick={addKeyword} disabled={!currentKeyword.trim() || keywords.length >= 3 || startAnalysisMutation.isPending} variant="outline"><Plus className="h-4 w-4" /></Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">{keyword}<button onClick={() => removeKeyword(index)}><X className="h-3 w-3" /></button></Badge>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Your Website (Optional)</label>
          <Input placeholder="https://yourwebsite.com" value={userWebsite} onChange={(e) => setUserWebsite(e.target.value)} disabled={startAnalysisMutation.isPending} />
        </div>
        <Button onClick={handleAnalysis} disabled={keywords.length === 0 || startAnalysisMutation.isPending} className="w-full bg-gradient-to-r from-purple-600 to-blue-600">
          {startAnalysisMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Starting...</> : "Start Analysis"}
        </Button>
      </CardContent>
    </Card>
  )
}

/**
 * The main page component that orchestrates the different views.
 */
function CompetitorPageContent() {
  const { useCompetitorHistory } = useSeoQueries();
  const { data: history, isLoading } = useCompetitorHistory();
  const [viewingAnalysisId, setViewingAnalysisId] = useState<string | null>(null);
  
  if (viewingAnalysisId) {
    return <CompetitorResultPage analysisId={viewingAnalysisId} onBack={() => setViewingAnalysisId(null)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg"><Users className="h-6 w-6 text-white" /></div>
          <div><h1 className="text-2xl font-bold">Competitor Analysis</h1><p className="text-gray-600">Analyze your competitors' SEO strategies</p></div>
        </div>
      </header>
      <main className="p-6">
        <Tabs defaultValue="new-analysis" className="space-y-6">
          <TabsList><TabsTrigger value="new-analysis">New Analysis</TabsTrigger><TabsTrigger value="history">History</TabsTrigger></TabsList>
          <TabsContent value="new-analysis"><CompetitorStartContent onAnalysisStart={(id) => setViewingAnalysisId(id)} /></TabsContent>
          <TabsContent value="history">
            <Card>
              <CardHeader><CardTitle>Analysis History</CardTitle><CardDescription>Click on any past analysis to view the detailed report.</CardDescription></CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
                ) : history?.data?.length > 0 ? (
                  <div className="space-y-4">
                    {history.data.map((analysis: AnalysisResult) => (
                      <div key={analysis._id} className="border rounded-lg p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer" onClick={() => setViewingAnalysisId(analysis._id)}>
                        <div>
                          <p className="font-medium">{analysis.keywords.join(", ")}</p>
                          <p className="text-sm text-gray-500">{new Date(analysis.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{analysis.summary?.avgCompetitorScore || 'N/A'}/100</div>
                          <Badge variant="secondary">{analysis.summary?.totalCompetitors || 0} competitors</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">No analysis history found.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

/**
 * The final exported page, wrapped in a ProtectedRoute.
 */
export default function CompetitorPage() {
  return (
    <ProtectedRoute requiredPlan="basic">
      <CompetitorPageContent />
    </ProtectedRoute>
  )
}