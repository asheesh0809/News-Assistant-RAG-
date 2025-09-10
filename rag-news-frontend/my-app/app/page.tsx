import { Sidebar } from "@/components/sidebar"
import { QuestionInterface } from "@/components/question-interface"
import { FreshnessIndicator } from "@/components/freshness-indicator"

export default function HomePage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <header className="border-b border-border bg-card/50 px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground">RAG News Assistant</h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                Ask questions about current news and get cited answers
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <FreshnessIndicator />
            </div>
          </div>
          <div className="md:hidden mt-2">
            <FreshnessIndicator />
          </div>
        </header>
        <div className="flex-1 overflow-hidden">
          <QuestionInterface />
        </div>
      </main>
    </div>
  )
}
