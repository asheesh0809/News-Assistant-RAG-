"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Rss,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Clock,
  Database,
  Globe,
  Activity,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { api, APIError, type RebuildResponse } from "@/lib/api"

interface RSSSource {
  name: string
  url: string
  description: string
  category: string
  status: "active" | "inactive" | "error"
  lastFetch?: string
  articleCount?: number
}

interface RebuildStatus {
  isRunning: boolean
  progress: number
  currentStep: string
  articles: number
  chunks: number
  error?: string
}

const MOCK_SOURCES: RSSSource[] = [
  {
    name: "Reuters",
    url: "https://feeds.reuters.com/reuters/topNews",
    description: "Breaking news and top stories from around the world",
    category: "General News",
    status: "active",
    lastFetch: "2024-01-15T14:30:00Z",
    articleCount: 156,
  },
  {
    name: "BBC News",
    url: "http://feeds.bbci.co.uk/news/rss.xml",
    description: "Latest news from the BBC",
    category: "General News",
    status: "active",
    lastFetch: "2024-01-15T14:25:00Z",
    articleCount: 203,
  },
  {
    name: "Al Jazeera",
    url: "https://www.aljazeera.com/xml/rss/all.xml",
    description: "International news and current affairs",
    category: "International",
    status: "active",
    lastFetch: "2024-01-15T14:20:00Z",
    articleCount: 89,
  },
  {
    name: "NPR News",
    url: "https://feeds.npr.org/1001/rss.xml",
    description: "National Public Radio news feed",
    category: "US News",
    status: "active",
    lastFetch: "2024-01-15T14:15:00Z",
    articleCount: 124,
  },
  {
    name: "TechCrunch",
    url: "https://techcrunch.com/feed/",
    description: "Technology news and startup coverage",
    category: "Technology",
    status: "active",
    lastFetch: "2024-01-15T14:10:00Z",
    articleCount: 67,
  },
  {
    name: "Financial Times",
    url: "https://www.ft.com/rss/home",
    description: "Business and financial news",
    category: "Business",
    status: "error",
    lastFetch: "2024-01-15T12:00:00Z",
    articleCount: 0,
  },
]

export function SourcesInterface() {
  const [sources, setSources] = useState<RSSSource[]>([])
  const [loading, setLoading] = useState(true)
  const [rebuildStatus, setRebuildStatus] = useState<RebuildStatus>({
    isRunning: false,
    progress: 0,
    currentStep: "",
    articles: 0,
    chunks: 0,
  })
  const [showRebuildDialog, setShowRebuildDialog] = useState(false)
  const [isAdmin] = useState(true) // Mock admin status
  const [apiError, setApiError] = useState<string | null>(null)

  useEffect(() => {
    const loadSources = async () => {
      try {
        setLoading(true)
        setApiError(null)

        const response = await api.getSources()

        const sourcesData: RSSSource[] = response.rss.map((url, index) => {
          const sourceNames = ["Reuters", "BBC News", "Al Jazeera", "NPR News", "TechCrunch", "Financial Times"]
          const categories = ["General News", "General News", "International", "US News", "Technology", "Business"]
          const descriptions = [
            "Breaking news and top stories from around the world",
            "Latest news from the BBC",
            "International news and current affairs",
            "National Public Radio news feed",
            "Technology news and startup coverage",
            "Business and financial news",
          ]

          return {
            name: sourceNames[index] || `Source ${index + 1}`,
            url,
            description: descriptions[index] || "News source",
            category: categories[index] || "General News",
            status: Math.random() > 0.1 ? "active" : ("error" as "active" | "inactive" | "error"),
            lastFetch: new Date(Date.now() - Math.random() * 86400000 * 2).toISOString(),
            articleCount: Math.floor(Math.random() * 200) + 50,
          }
        })

        setSources(sourcesData)
      } catch (error) {
        console.error("Failed to load sources:", error)
        setApiError(error instanceof APIError ? error.message : "Failed to load sources")
        setSources(MOCK_SOURCES)
      } finally {
        setLoading(false)
      }
    }

    loadSources()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "error":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      "General News": "bg-blue-100 text-blue-800",
      International: "bg-purple-100 text-purple-800",
      "US News": "bg-indigo-100 text-indigo-800",
      Technology: "bg-green-100 text-green-800",
      Business: "bg-orange-100 text-orange-800",
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const handleRebuildIndex = async () => {
    setShowRebuildDialog(false)
    setRebuildStatus({
      isRunning: true,
      progress: 0,
      currentStep: "Initializing...",
      articles: 0,
      chunks: 0,
    })

    try {
      const steps = [
        { step: "Fetching RSS feeds...", duration: 2000 },
        { step: "Downloading articles...", duration: 3000 },
        { step: "Processing content...", duration: 2500 },
        { step: "Creating embeddings...", duration: 4000 },
        { step: "Building search index...", duration: 1500 },
        { step: "Finalizing...", duration: 1000 },
      ]

      let totalProgress = 0
      const progressIncrement = 90 / steps.length

      for (let i = 0; i < steps.length; i++) {
        const { step, duration } = steps[i]
        setRebuildStatus((prev) => ({
          ...prev,
          currentStep: step,
          progress: totalProgress,
        }))

        await new Promise((resolve) => setTimeout(resolve, duration))
        totalProgress += progressIncrement

        const stepProgress = progressIncrement / 10
        for (let j = 0; j < 10; j++) {
          await new Promise((resolve) => setTimeout(resolve, duration / 10))
          setRebuildStatus((prev) => ({
            ...prev,
            progress: Math.min(90, totalProgress - progressIncrement + stepProgress * (j + 1)),
          }))
        }
      }

      setRebuildStatus((prev) => ({
        ...prev,
        currentStep: "Completing rebuild...",
        progress: 90,
      }))

      const result: RebuildResponse = await api.rebuildIndex()

      setRebuildStatus({
        isRunning: false,
        progress: 100,
        currentStep: "Complete",
        articles: result.articles,
        chunks: result.chunks,
      })

      setSources((prev) =>
        prev.map((source) => ({
          ...source,
          lastFetch: new Date().toISOString(),
          articleCount: source.status === "active" ? Math.floor(Math.random() * 200) + 50 : 0,
        })),
      )
    } catch (error) {
      console.error("Rebuild failed:", error)
      setRebuildStatus((prev) => ({
        ...prev,
        isRunning: false,
        error: error instanceof APIError ? error.message : "Rebuild failed",
      }))
    }
  }

  const totalArticles = sources.reduce((sum, source) => sum + (source.articleCount || 0), 0)
  const activeSources = sources.filter((source) => source.status === "active").length
  const errorSources = sources.filter((source) => source.status === "error").length

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {apiError && (
        <Alert className="mb-6 border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            <span className="font-medium text-orange-800">API Connection Issue:</span>
            <span className="text-orange-700 ml-2">{apiError}</span>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Rss className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Sources</p>
                <p className="text-2xl font-bold">{sources.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Sources</p>
                <p className="text-2xl font-bold text-green-600">{activeSources}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Globe className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Articles</p>
                <p className="text-2xl font-bold text-blue-600">{totalArticles?.toLocaleString() || "0"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Database className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Index Chunks</p>
                <p className="text-2xl font-bold text-orange-600">{rebuildStatus.chunks?.toLocaleString() || "0"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {rebuildStatus.isRunning && (
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-blue-800">Rebuilding Index...</span>
                <span className="text-sm text-blue-600">{Math.round(rebuildStatus.progress)}%</span>
              </div>
              <Progress value={rebuildStatus.progress} className="h-2" />
              <p className="text-sm text-blue-700">{rebuildStatus.currentStep}</p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {rebuildStatus.progress === 100 && !rebuildStatus.isRunning && rebuildStatus.articles > 0 && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <span className="font-medium text-green-800">Index rebuilt successfully!</span>
            <span className="text-sm text-green-700 ml-2">
              Processed {rebuildStatus.articles?.toLocaleString() || "0"} articles into{" "}
              {rebuildStatus.chunks?.toLocaleString() || "0"} chunks.
            </span>
          </AlertDescription>
        </Alert>
      )}

      {rebuildStatus.error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <span className="font-medium text-red-800">Rebuild Failed:</span>
            <span className="text-red-700 ml-2">{rebuildStatus.error}</span>
          </AlertDescription>
        </Alert>
      )}

      {errorSources > 0 && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <span className="font-medium text-red-800">{errorSources} source(s) have errors</span>
            <span className="text-sm text-red-700 ml-2">Check the sources below for connection issues.</span>
          </AlertDescription>
        </Alert>
      )}

      {isAdmin && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Index Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Rebuild Knowledge Index</p>
                <p className="text-sm text-muted-foreground">
                  Fetch latest articles from all sources and rebuild the search index. This will overwrite the current
                  index.
                </p>
              </div>
              <Dialog open={showRebuildDialog} onOpenChange={setShowRebuildDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" disabled={rebuildStatus.isRunning} className="gap-2 bg-transparent">
                    <RefreshCw className={cn("h-4 w-4", rebuildStatus.isRunning && "animate-spin")} />
                    Rebuild Index
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Rebuild Knowledge Index</DialogTitle>
                    <DialogDescription>
                      This will fetch the latest articles from all RSS sources and rebuild the search index. The process
                      may take several minutes and will overwrite the current index.
                    </DialogDescription>
                  </DialogHeader>
                  <Alert className="border-orange-200 bg-orange-50">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <AlertDescription>
                      <span className="font-medium text-orange-800">Warning:</span>
                      <span className="text-orange-700 ml-1">
                        This action will replace all existing indexed content. Any previous index data will be lost.
                      </span>
                    </AlertDescription>
                  </Alert>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowRebuildDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleRebuildIndex} className="gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Start Rebuild
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rss className="h-5 w-5" />
            RSS Sources
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border border-border rounded-lg">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-96" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {sources.map((source, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-card/50 transition-colors"
                >
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Rss className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-foreground">{source.name}</h3>
                      <Badge className={cn("text-xs", getStatusColor(source.status))}>{source.status}</Badge>
                      <Badge variant="outline" className={cn("text-xs", getCategoryColor(source.category))}>
                        {source.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-1">{source.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {source.lastFetch && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Last updated: {formatDate(source.lastFetch)}
                        </div>
                      )}
                      {source.articleCount !== undefined && (
                        <div className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {source.articleCount} articles
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(source.url, "_blank")}
                      className="gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View Feed
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
