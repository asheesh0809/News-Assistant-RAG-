"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Settings,
  Palette,
  Monitor,
  Sun,
  Moon,
  Database,
  Cpu,
  Layers,
  Target,
  Info,
  RotateCcw,
  Save,
} from "lucide-react"
import { useTheme } from "next-themes"

interface AppSettings {
  theme: "light" | "dark" | "system"
  density: "compact" | "comfortable"
  autoSave: boolean
  showCitationPreviews: boolean
  maxHistoryItems: number
  defaultSearchResults: number
}

interface SystemConfig {
  embeddingModel: string
  chunkSize: number
  chunkOverlap: number
  topK: number
  fetchK: number
  model: string
}

export function SettingsInterface() {
  const { theme, setTheme } = useTheme()
  const [settings, setSettings] = useState<AppSettings>({
    theme: "system",
    density: "comfortable",
    autoSave: true,
    showCitationPreviews: true,
    maxHistoryItems: 100,
    defaultSearchResults: 5,
  })
  const [systemConfig] = useState<SystemConfig>({
    embeddingModel: "BAAI/bge-small-en-v1.5",
    chunkSize: 1000,
    chunkOverlap: 200,
    topK: 5,
    fetchK: 20,
    model: "deepseek/deepseek-chat",
  })
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem("rag-news-settings")
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings(parsed)
      } catch (error) {
        console.error("Failed to parse settings:", error)
      }
    }
  }, [])

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const saveSettings = () => {
    localStorage.setItem("rag-news-settings", JSON.stringify(settings))
    setHasChanges(false)

    // Apply theme change
    if (settings.theme !== theme) {
      setTheme(settings.theme)
    }
  }

  const resetSettings = () => {
    const defaultSettings: AppSettings = {
      theme: "system",
      density: "comfortable",
      autoSave: true,
      showCitationPreviews: true,
      maxHistoryItems: 100,
      defaultSearchResults: 5,
    }
    setSettings(defaultSettings)
    setHasChanges(true)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Save Banner */}
      {hasChanges && (
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-blue-800">You have unsaved changes</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={resetSettings} className="bg-transparent">
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </Button>
              <Button size="sm" onClick={saveSettings}>
                <Save className="h-3 w-3 mr-1" />
                Save Changes
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Theme</Label>
              <Select
                value={settings.theme}
                onValueChange={(value: "light" | "dark" | "system") => updateSetting("theme", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      Light
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      Dark
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      System
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Interface Density</Label>
              <Select
                value={settings.density}
                onValueChange={(value: "compact" | "comfortable") => updateSetting("density", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comfortable">Comfortable</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Show Citation Previews</Label>
                <p className="text-xs text-muted-foreground">Display source snippets in citation cards</p>
              </div>
              <Switch
                checked={settings.showCitationPreviews}
                onCheckedChange={(checked) => updateSetting("showCitationPreviews", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Behavior Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Behavior
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Auto-save History</Label>
                <p className="text-xs text-muted-foreground">Automatically save questions and answers</p>
              </div>
              <Switch checked={settings.autoSave} onCheckedChange={(checked) => updateSetting("autoSave", checked)} />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Max History Items</Label>
                <span className="text-sm text-muted-foreground">{settings.maxHistoryItems}</span>
              </div>
              <Slider
                value={[settings.maxHistoryItems]}
                onValueChange={([value]) => updateSetting("maxHistoryItems", value)}
                max={500}
                min={10}
                step={10}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Default Search Results</Label>
                <span className="text-sm text-muted-foreground">{settings.defaultSearchResults}</span>
              </div>
              <Slider
                value={[settings.defaultSearchResults]}
                onValueChange={([value]) => updateSetting("defaultSearchResults", value)}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* System Configuration (Read-only) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              System Configuration
              <Badge variant="outline" className="text-xs">
                Read-only
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">Language Model</Label>
                </div>
                <p className="text-sm text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                  {systemConfig.model}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">Embedding Model</Label>
                </div>
                <p className="text-sm text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                  {systemConfig.embeddingModel}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">Chunk Size</Label>
                </div>
                <p className="text-sm text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                  {systemConfig.chunkSize} chars
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">Chunk Overlap</Label>
                </div>
                <p className="text-sm text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                  {systemConfig.chunkOverlap} chars
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">Top K Results</Label>
                </div>
                <p className="text-sm text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                  {systemConfig.topK}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">Fetch K Candidates</Label>
                </div>
                <p className="text-sm text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                  {systemConfig.fetchK}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
