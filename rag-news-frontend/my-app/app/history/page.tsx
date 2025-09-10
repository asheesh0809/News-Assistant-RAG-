import { Sidebar } from "@/components/sidebar"
import { HistoryInterface } from "@/components/history-interface"

export default function HistoryPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="border-b border-border bg-card/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Question History</h1>
              <p className="text-sm text-muted-foreground">Review your past questions and answers</p>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-hidden">
          <HistoryInterface />
        </div>
      </div>
    </div>
  )
}
