import { Sidebar } from "@/components/sidebar"
import { SettingsInterface } from "@/components/settings-interface"

export default function SettingsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="border-b border-border bg-card/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Settings</h1>
              <p className="text-sm text-muted-foreground">Configure your RAG News Assistant preferences</p>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-hidden">
          <SettingsInterface />
        </div>
      </div>
    </div>
  )
}
