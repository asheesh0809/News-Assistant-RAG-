interface Citation {
  index: number
  title: string
  url: string
  published: string
  snippet: string
}

interface AskResponse {
  answer: string
  citations: Citation[]
}

interface SourcesResponse {
  rss: string[]
}

interface RebuildResponse {
  articles: number
  chunks: number
  status: string
}

interface HealthResponse {
  status: string
}

class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message)
    this.name = "APIError"
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  const defaultHeaders = {
    "Content-Type": "application/json",
    "X-Client": "rag-news-frontend",
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  }

  try {
    const response = await fetch(url, config)

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`

      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.detail || errorData.error || errorMessage
      } catch {
        // If we can't parse the error response, use the default message
      }

      throw new APIError(errorMessage, response.status)
    }

    const data = await response.json()
    if (data === null || data === undefined) {
      throw new APIError("Invalid response from server", response.status)
    }

    return data
  } catch (error) {
    if (error instanceof APIError) {
      throw error
    }

    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new APIError("Network error: Unable to connect to backend", 0, "NETWORK_ERROR")
    }

    // Network or other errors
    throw new APIError(error instanceof Error ? error.message : "Network error occurred", 0)
  }
}

export const api = {
  // Health check
  async health(): Promise<HealthResponse> {
    return apiRequest<HealthResponse>("/health")
  },

  // Ask a question
  async ask(query: string): Promise<AskResponse> {
    if (query.trim().length < 3) {
      throw new APIError("Query must be at least 3 characters long", 400)
    }

    return apiRequest<AskResponse>("/ask", {
      method: "POST",
      body: JSON.stringify({ question: query }),
    })
  },

  // Get RSS sources
  async getSources(): Promise<SourcesResponse> {
    return apiRequest<SourcesResponse>("/ingest/sources")
  },

  // Rebuild index
  async rebuildIndex(): Promise<RebuildResponse> {
    return apiRequest<RebuildResponse>("/ingest/rebuild", {
      method: "POST",
    })
  },
}

export { APIError }
export type { Citation, AskResponse, SourcesResponse, RebuildResponse, HealthResponse }
