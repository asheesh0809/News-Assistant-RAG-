import { Sidebar } from "@/components/sidebar"
import { SourcesInterface } from "@/components/sources-interface"

export default function SourcesPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="border-b border-border bg-card/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">News Sources</h1>
              <p className="text-sm text-muted-foreground">Manage RSS feeds and rebuild the knowledge index</p>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-hidden">
          <SourcesInterface />
        </div>
      </div>
    </div>
  )
}
