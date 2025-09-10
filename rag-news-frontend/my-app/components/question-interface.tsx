"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ExternalLink, Clock, AlertCircle, Sparkles, Copy, Check, Wifi, WifiOff, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { api, APIError, type Citation, type AskResponse } from "@/lib/api"

interface Answer {
  answer: string
  citations: Citation[]
}

const EXAMPLE_QUESTIONS = [
  "What are the latest developments in AI technology?",
  "What's happening with climate change policies?",
  "Recent updates on global economic trends?",
  "Latest news about space exploration?",
]

export function QuestionInterface() {
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState<Answer | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedAnswer, setCopiedAnswer] = useState(false)
  const [highlightedCitation, setHighlightedCitation] = useState<number | null>(null)
  const [apiHealthy, setApiHealthy] = useState<boolean | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const checkHealth = async () => {
      try {
        await api.health()
        setApiHealthy(true)
      } catch (error) {
        setApiHealthy(false)
        console.warn("API health check failed:", error)
      }
    }

    checkHealth()
    const interval = setInterval(checkHealth, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const queryParam = urlParams.get("q")
    if (queryParam) {
      setQuestion(queryParam)
      window.history.replaceState({}, "", window.location.pathname)
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        textareaRef.current?.focus()
      }
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        if (question.trim().length >= 3 && !loading) {
          handleSubmit(e as any)
        }
      }
      if (e.key === "Escape") {
        setError(null)
        textareaRef.current?.blur()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [question, loading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (question.trim().length < 3) return

    setLoading(true)
    setError(null)
    setAnswer(null)

    try {
      const response: AskResponse = await api.ask(question.trim())

      setAnswer({
        answer: response.answer,
        citations: response.citations,
      })

      const settings = localStorage.getItem("rag-news-settings")
      const autoSave = settings ? JSON.parse(settings).autoSave !== false : true

      if (autoSave) {
        const historyItem = {
          id: Date.now().toString(),
          question: question.trim(),
          answer: response.answer,
          citations: response.citations,
          timestamp: new Date().toISOString(),
        }

        const existingHistory = localStorage.getItem("rag-news-history")
        const history = existingHistory ? JSON.parse(existingHistory) : []
        const updatedHistory = [historyItem, ...history].slice(0, 100)

        localStorage.setItem("rag-news-history", JSON.stringify(updatedHistory))
      }
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.message)
        if (err.status === 0) {
          setApiHealthy(false)
        }
      } else {
        setError("An unexpected error occurred. Please try again.")
      }
      console.error("Question submission error:", err)
    } finally {
      setLoading(false)
    }
  }

  const copyAnswer = async () => {
    if (!answer) return
    try {
      await navigator.clipboard.writeText(answer.answer)
      setCopiedAnswer(true)
      setTimeout(() => setCopiedAnswer(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const renderAnswerWithCitations = (text: string) => {
    const parts = text.split(/(\[\d+\])/)
    return parts.map((part, index) => {
      const match = part.match(/\[(\d+)\]/)
      if (match) {
        const citationIndex = Number.parseInt(match[1])
        return (
          <button
            key={index}
            className={cn(
              "inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium rounded transition-all duration-200",
              "bg-primary/10 text-primary hover:bg-primary/20 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/50",
              highlightedCitation === citationIndex && "bg-primary/30 scale-105",
            )}
            onClick={() => {
              const element = document.getElementById(`citation-${citationIndex}`)
              element?.scrollIntoView({ behavior: "smooth", block: "center" })
              setHighlightedCitation(citationIndex)
              setTimeout(() => setHighlightedCitation(null), 2000)
            }}
            onMouseEnter={() => setHighlightedCitation(citationIndex)}
            onMouseLeave={() => setHighlightedCitation(null)}
          >
            [{citationIndex}]
          </button>
        )
      }
      return <span key={index}>{part}</span>
    })
  }

  const handleExampleClick = (exampleQuestion: string) => {
    setQuestion(exampleQuestion)
    textareaRef.current?.focus()
  }

  return (
    <div className="flex h-full flex-col lg:flex-row">
      <div className="flex-1 flex flex-col p-3 sm:p-4 md:p-6 max-w-4xl mx-auto lg:max-w-none">
        {apiHealthy === false && (
          <Alert className="mb-3 sm:mb-4 border-orange-200 bg-orange-50 animate-in slide-in-from-top-2 duration-300">
            <WifiOff className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-sm">
              <span className="font-medium text-orange-800">API Connection Issue</span>
              <span className="text-orange-700 ml-1 sm:ml-2 block sm:inline">
                Unable to connect to the backend. Using offline mode with limited functionality.
              </span>
            </AlertDescription>
          </Alert>
        )}

        {apiHealthy === true && (
          <div className="flex items-center gap-2 mb-3 sm:mb-4 text-xs text-muted-foreground">
            <Wifi className="h-3 w-3 text-green-600" />
            <span>Connected to RAG News API</span>
          </div>
        )}

        <div className="mb-6 sm:mb-8">
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                placeholder="Ask a question about current news... (Ctrl/Cmd + K to focus)"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="min-h-[80px] sm:min-h-[100px] md:min-h-[120px] resize-none text-sm sm:text-base pr-12 focus:ring-2 focus:ring-primary/20 transition-all duration-200 touch-manipulation"
                disabled={loading || apiHealthy === false}
                maxLength={500}
              />
              <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 flex items-center gap-2">
                <span
                  className={cn(
                    "text-xs transition-colors",
                    question.length > 450 ? "text-orange-600" : "text-muted-foreground",
                  )}
                >
                  {question.length}/500
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-2 sm:gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                {question.length < 3 && question.length > 0 && (
                  <p className="text-xs text-destructive">Question must be at least 3 characters</p>
                )}
                <p className="text-xs text-muted-foreground hidden md:block">Press Ctrl/Cmd + Enter to submit</p>
              </div>
              <Button
                type="submit"
                disabled={question.trim().length < 3 || loading || apiHealthy === false}
                className="gap-2 min-w-[90px] sm:min-w-[100px] transition-all duration-200 hover:scale-105 touch-manipulation h-10 sm:h-11"
                size="default"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span className="hidden sm:inline">Thinking...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span className="hidden xs:inline">Ask</span>
                  </>
                )}
              </Button>
            </div>
          </form>

          {!answer && !loading && (
            <div className="mt-4 sm:mt-6 animate-in fade-in duration-500">
              <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                Try asking about:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {EXAMPLE_QUESTIONS.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleClick(example)}
                    disabled={apiHealthy === false}
                    className="text-left p-3 sm:p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-card/50 transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary/50 touch-manipulation min-h-[60px] flex items-center"
                  >
                    <span className="line-clamp-2">{example}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {error && (
          <Alert className="mb-4 sm:mb-6 border-destructive/50 bg-destructive/5 animate-in slide-in-from-top-2 duration-300">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive text-sm pr-2">{error}</AlertDescription>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 bg-transparent hover:bg-destructive/10 touch-manipulation"
              onClick={() => setError(null)}
            >
              Dismiss
            </Button>
          </Alert>
        )}

        {loading && (
          <Card className="mb-4 sm:mb-6 animate-pulse border-primary/20">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <Skeleton className="h-4 w-24 sm:w-32" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3 pt-0">
              <Skeleton className="h-3 sm:h-4 w-full" />
              <Skeleton className="h-3 sm:h-4 w-full" />
              <Skeleton className="h-3 sm:h-4 w-3/4" />
              <div className="flex gap-2 mt-3 sm:mt-4">
                <Skeleton className="h-6 w-6 sm:w-8" />
                <Skeleton className="h-6 w-6 sm:w-8" />
                <Skeleton className="h-6 w-6 sm:w-8" />
              </div>
            </CardContent>
          </Card>
        )}

        {answer && !loading && (
          <Card className="mb-4 sm:mb-6 animate-in slide-in-from-bottom-4 duration-500 border-primary/20 shadow-lg">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Answer
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyAnswer}
                  className="gap-1 sm:gap-2 hover:bg-primary/10 transition-all duration-200 touch-manipulation h-8 sm:h-9 px-2 sm:px-3"
                >
                  {copiedAnswer ? (
                    <>
                      <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                      <span className="hidden sm:inline">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Copy</span>
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-sm sm:text-base leading-relaxed text-balance">
                {renderAnswerWithCitations(answer.answer)}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {answer && !loading && (
        <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-border p-3 sm:p-4 md:p-6 bg-gradient-to-b from-card/30 to-card/10 animate-in slide-in-from-bottom-4 lg:slide-in-from-right-4 duration-500">
          <div className="lg:sticky lg:top-0">
            <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base text-card-foreground flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Sources ({answer.citations.length})
            </h3>
            <div className="space-y-3 sm:space-y-4 max-h-[250px] sm:max-h-[300px] lg:max-h-[calc(100vh-200px)] overflow-y-auto">
              {answer.citations.map((citation) => (
                <Card
                  key={citation.index}
                  id={`citation-${citation.index}`}
                  className={cn(
                    "p-3 sm:p-4 transition-all duration-200 hover:shadow-md cursor-pointer touch-manipulation",
                    highlightedCitation === citation.index && "ring-2 ring-primary/50 shadow-lg scale-[1.02]",
                  )}
                  onClick={() => window.open(citation.url, "_blank")}
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <Badge
                      variant="secondary"
                      className={cn(
                        "flex-shrink-0 transition-colors text-xs",
                        highlightedCitation === citation.index && "bg-primary text-primary-foreground",
                      )}
                    >
                      {citation.index}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-xs sm:text-sm leading-tight mb-2 text-pretty hover:text-primary transition-colors line-clamp-2">
                        {citation.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mb-2 sm:mb-3 line-clamp-3 sm:line-clamp-4 leading-relaxed">
                        {citation.snippet}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span className="truncate">{formatDate(citation.published)}</span>
                        </div>
                        <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
