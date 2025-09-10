"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { MessageSquare, Rss, History, Settings, Moon, Sun, ChevronLeft, ChevronRight } from "lucide-react"
import { useTheme } from "next-themes"

const navigation = [
  { name: "Ask", href: "/", icon: MessageSquare },
  { name: "Sources", href: "/sources", icon: Rss },
  { name: "History", href: "/history", icon: History },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
    // Check for saved sidebar state
    const savedState = localStorage.getItem("sidebar-collapsed")
    if (savedState) {
      setCollapsed(JSON.parse(savedState))
    }
  }, [])

  const toggleCollapsed = () => {
    const newState = !collapsed
    setCollapsed(newState)
    localStorage.setItem("sidebar-collapsed", JSON.stringify(newState))
  }

  if (!mounted) {
    return (
      <div className="w-64 bg-sidebar border-r border-sidebar-border">
        <div className="p-4 border-b border-sidebar-border">
          <div className="h-8 bg-sidebar-accent rounded animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2 animate-in slide-in-from-left duration-200">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm">
              <MessageSquare className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <span className="font-semibold text-sidebar-foreground">News AI</span>
              <p className="text-xs text-sidebar-foreground/60">RAG Assistant</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleCollapsed}
          className="text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200 hover:scale-110"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:scale-105",
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4 flex-shrink-0 transition-transform duration-200",
                      !isActive && "group-hover:scale-110",
                    )}
                  />
                  {!collapsed && <span className="animate-in slide-in-from-left duration-200">{item.name}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-2 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className={cn(
            "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200 hover:scale-105",
            collapsed && "justify-center",
          )}
        >
          <div className="relative">
            {theme === "dark" ? (
              <Sun className="h-4 w-4 transition-transform duration-200 hover:rotate-12" />
            ) : (
              <Moon className="h-4 w-4 transition-transform duration-200 hover:-rotate-12" />
            )}
          </div>
          {!collapsed && (
            <span className="animate-in slide-in-from-left duration-200">
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </span>
          )}
        </Button>
      </div>
    </div>
  )
}
