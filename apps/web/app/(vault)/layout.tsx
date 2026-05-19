"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Menu } from 'lucide-react'
import { AppSidebar, type PanelType } from '@/components/app-sidebar'
import { AlertsPanel } from '@/components/alerts-panel'
import { SettingsPanel } from '@/components/settings-panel'
import { useVault } from '@/contexts/vault-context'

export default function VaultLayout({ children }: { children: React.ReactNode }) {
  const { isUnlocked } = useVault()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activePanel, setActivePanel] = useState<PanelType>(null)

  useEffect(() => {
    if (!isUnlocked) {
      router.replace('/login')
    }
  }, [isUnlocked, router])

  if (!isUnlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <AppSidebar onOpenPanel={setActivePanel} activePanel={activePanel} />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative flex h-full w-60">
            <AppSidebar onOpenPanel={(p) => { setActivePanel(p); setSidebarOpen(false) }} activePanel={activePanel} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar (mobile only) */}
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border bg-background px-4 md:hidden">
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">CryptoVault</span>
          </div>
          <div className="flex-1" />
          <span className="flex items-center gap-1.5 text-xs text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Encrypted
          </span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Slide-over panels */}
      {activePanel === 'alerts' && (
        <AlertsPanel onClose={() => setActivePanel(null)} />
      )}
      {activePanel === 'settings' && (
        <SettingsPanel onClose={() => setActivePanel(null)} />
      )}
    </div>
  )
}
