"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Clock, RotateCcw, Trash2, MessageSquare, ExternalLink, Calendar } from "lucide-react"

interface HistoryItem {
  id: string
  question: string
  answer: string
  citations: Array<{
    index: number
    title: string
    url: string
    published: string
    snippet: string
  }>
  timestamp: string
}

export function HistoryInterface() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredHistory, setFilteredHistory] = useState<HistoryItem[]>([])

  useEffect(() => {
    // Load history from localStorage
    const savedHistory = localStorage.getItem("rag-news-history")
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory)
        setHistory(parsed)
        setFilteredHistory(parsed)
      } catch (error) {
        console.error("Failed to parse history:", error)
        // Create some mock history for demonstration
        const mockHistory = generateMockHistory()
        setHistory(mockHistory)
        setFilteredHistory(mockHistory)
      }
    } else {
      // Create some mock history for demonstration
      const mockHistory = generateMockHistory()
      setHistory(mockHistory)
      setFilteredHistory(mockHistory)
    }
  }, [])

  useEffect(() => {
    // Filter history based on search query
    if (searchQuery.trim() === "") {
      setFilteredHistory(history)
    } else {
      const filtered = history.filter(
        (item) =>
          item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredHistory(filtered)
    }
  }, [searchQuery, history])

  const generateMockHistory = (): HistoryItem[] => {
    return [
      {
        id: "1",
        question: "What are the latest developments in artificial intelligence?",
        answer:
          "Recent AI developments include breakthrough language models with improved reasoning [1], advances in multimodal AI systems [2], and significant infrastructure investments by tech companies [3].",
        citations: [
          {
            index: 1,
            title: "AI Breakthrough: New Language Model Shows Human-Level Reasoning",
            url: "https://example.com/ai-breakthrough",
            published: "2024-01-15T10:30:00Z",
            snippet: "Researchers have developed a new language model...",
          },
          {
            index: 2,
            title: "Multimodal AI Systems Reach New Milestone",
            url: "https://example.com/multimodal-ai",
            published: "2024-01-14T15:45:00Z",
            snippet: "The latest multimodal AI systems can now process...",
          },
          {
            index: 3,
            title: "Tech Giants Double Down on AI Infrastructure",
            url: "https://example.com/ai-investment",
            published: "2024-01-13T09:15:00Z",
            snippet: "Major technology companies announced plans...",
          },
        ],
        timestamp: "2024-01-15T16:45:00Z",
      },
      {
        id: "2",
        question: "What's the current situation with climate change policies?",
        answer:
          "Climate policies are evolving rapidly with new international agreements [1], renewable energy investments reaching record levels [2], and carbon pricing mechanisms being implemented globally [3].",
        citations: [
          {
            index: 1,
            title: "Global Climate Summit Reaches Historic Agreement",
            url: "https://example.com/climate-agreement",
            published: "2024-01-14T12:00:00Z",
            snippet: "World leaders have agreed to ambitious new climate targets...",
          },
          {
            index: 2,
            title: "Renewable Energy Investment Hits $2 Trillion Milestone",
            url: "https://example.com/renewable-investment",
            published: "2024-01-13T14:30:00Z",
            snippet: "Global investment in renewable energy technologies...",
          },
          {
            index: 3,
            title: "Carbon Pricing Expands to 50 Countries",
            url: "https://example.com/carbon-pricing",
            published: "2024-01-12T11:15:00Z",
            snippet: "Carbon pricing mechanisms are now active in 50 countries...",
          },
        ],
        timestamp: "2024-01-14T09:20:00Z",
      },
      {
        id: "3",
        question: "Recent updates on space exploration missions?",
        answer:
          "Space exploration is advancing with successful Mars missions [1], lunar base preparations [2], and private space companies achieving new milestones [3].",
        citations: [
          {
            index: 1,
            title: "Mars Rover Discovers Evidence of Ancient Water",
            url: "https://example.com/mars-discovery",
            published: "2024-01-13T08:45:00Z",
            snippet: "The latest Mars rover mission has uncovered compelling evidence...",
          },
          {
            index: 2,
            title: "Lunar Base Construction Timeline Accelerated",
            url: "https://example.com/lunar-base",
            published: "2024-01-12T16:20:00Z",
            snippet: "Plans for the first permanent lunar base have been accelerated...",
          },
          {
            index: 3,
            title: "SpaceX Achieves Record-Breaking Launch Frequency",
            url: "https://example.com/spacex-record",
            published: "2024-01-11T13:10:00Z",
            snippet: "Private space company SpaceX has set a new record...",
          },
        ],
        timestamp: "2024-01-13T11:30:00Z",
      },
    ]
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return "Yesterday"
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const handleReask = (question: string) => {
    // Navigate to home page with the question pre-filled
    const url = new URL(window.location.origin)
    url.searchParams.set("q", question)
    window.location.href = url.toString()
  }

  const clearHistory = () => {
    setHistory([])
    setFilteredHistory([])
    localStorage.removeItem("rag-news-history")
  }

  const deleteItem = (id: string) => {
    const updated = history.filter((item) => item.id !== id)
    setHistory(updated)
    localStorage.setItem("rag-news-history", JSON.stringify(updated))
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Search and Controls */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search your question history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={clearHistory}
          className="gap-2 bg-transparent"
          disabled={history.length === 0}
        >
          <Trash2 className="h-4 w-4" />
          Clear All
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MessageSquare className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Questions</p>
                <p className="text-2xl font-bold">{history.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold text-blue-600">
                  {
                    history.filter((item) => {
                      const itemDate = new Date(item.timestamp)
                      const weekAgo = new Date()
                      weekAgo.setDate(weekAgo.getDate() - 7)
                      return itemDate > weekAgo
                    }).length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Showing Results</p>
                <p className="text-2xl font-bold text-green-600">{filteredHistory.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History List */}
      {filteredHistory.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {history.length === 0 ? "No questions yet" : "No matching questions"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {history.length === 0
                ? "Start asking questions to build your history"
                : "Try adjusting your search terms"}
            </p>
            {history.length === 0 && (
              <Button onClick={() => (window.location.href = "/")} className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Ask Your First Question
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-base leading-tight mb-2 text-pretty">{item.question}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDate(item.timestamp)}
                      <Badge variant="outline" className="text-xs">
                        {item.citations.length} sources
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleReask(item.question)} className="gap-2">
                      <RotateCcw className="h-3 w-3" />
                      Ask Again
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteItem(item.id)}
                      className="gap-2 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-sm text-muted-foreground mb-3 line-clamp-3 leading-relaxed">{item.answer}</div>
                <div className="flex flex-wrap gap-2">
                  {item.citations.slice(0, 3).map((citation) => (
                    <button
                      key={citation.index}
                      onClick={() => window.open(citation.url, "_blank")}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {citation.title.slice(0, 40)}...
                    </button>
                  ))}
                  {item.citations.length > 3 && (
                    <span className="text-xs text-muted-foreground px-2 py-1">
                      +{item.citations.length - 3} more sources
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
