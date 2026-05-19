"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Shield,
  LayoutDashboard,
  Key,
  Zap,
  Globe,
  Bell,
  Settings,
  LogOut,
  BarChart3,
  Lock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useVault } from '@/contexts/vault-context'

export type PanelType = 'alerts' | 'settings' | null

interface AppSidebarProps {
  onOpenPanel?: (panel: PanelType) => void
  activePanel?: PanelType
}

const NAV_MAIN = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/vault',     label: 'Vault',     icon: Key             },
  { href: '/generator', label: 'Generator', icon: Zap             },
  { href: '/report',    label: 'Report',    icon: BarChart3       },
  { href: '/phishing',  label: 'URL Check', icon: Globe           },
]

export function AppSidebar({ onOpenPanel, activePanel }: AppSidebarProps) {
  const pathname = usePathname()
  const { alerts, lock } = useVault()

  // badge = critical + high only
  const badgeCount = alerts.filter(a => !a.resolved && (a.severity === 'critical' || a.severity === 'high')).length

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(href))

  return (
    <aside className="flex h-full w-60 flex-col bg-sidebar border-r border-sidebar-border">

      {/* ── Logo ───────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border shrink-0">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/25">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground tracking-wide leading-none">CryptoVault</p>
          <p className="text-[10px] text-primary font-semibold tracking-[0.15em] uppercase mt-1">Shield</p>
        </div>
      </div>

      {/* ── Main nav ───────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 pt-4 pb-2 space-y-0.5">
        {NAV_MAIN.map(({ href, label, icon: Icon }) => {
          const active = isActive(href) && !activePanel
          const showBadge = href === '/dashboard' && badgeCount > 0
          return (
            <Link
              key={href}
              href={href}
              onClick={() => onOpenPanel?.(null)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-primary/12 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground border border-transparent',
              )}
            >
              <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-primary' : '')} />
              <span className="flex-1">{label}</span>
              {showBadge && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                  {badgeCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* ── VAULT ENCRYPTED card — sits above secondary nav ────────────── */}
      <div className="mx-3 mb-2 rounded-xl border border-primary/25 bg-primary/8 px-3 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 border border-primary/25">
            <Lock className="h-3.5 w-3.5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-primary tracking-wider uppercase leading-none">
              Vault Encrypted
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              AES-256-GCM · Zero Knowledge
            </p>
          </div>
        </div>
      </div>

      {/* ── Secondary nav (Alerts + Settings) ─────────────────────────── */}
      <div className="px-3 pb-2 space-y-0.5">
        <button
          onClick={() => onOpenPanel?.(activePanel === 'alerts' ? null : 'alerts')}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
            activePanel === 'alerts'
              ? 'bg-primary/12 text-primary border border-primary/20'
              : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground border border-transparent',
          )}
        >
          <Bell className={cn('h-4 w-4 shrink-0', activePanel === 'alerts' ? 'text-primary' : '')} />
          <span className="flex-1 text-left">Alerts</span>
          {badgeCount > 0 && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
              {badgeCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onOpenPanel?.(activePanel === 'settings' ? null : 'settings')}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
            activePanel === 'settings'
              ? 'bg-primary/12 text-primary border border-primary/20'
              : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground border border-transparent',
          )}
        >
          <Settings className={cn('h-4 w-4 shrink-0', activePanel === 'settings' ? 'text-primary' : '')} />
          <span className="flex-1 text-left">Settings</span>
        </button>
      </div>

      {/* ── Lock Vault ─────────────────────────────────────────────────── */}
      <div className="px-3 pb-3">
        <button
          onClick={lock}
          className="flex w-full items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-red-400 hover:bg-red-500/8 hover:border-red-500/20 transition-all duration-150"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Lock Vault</span>
        </button>
      </div>

      {/* ── User profile ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-4 border-t border-sidebar-border shrink-0">
        <div className="h-8 w-8 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
          <span className="text-xs font-bold text-primary">AS</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground truncate leading-none">Alex Smith</p>
          <p className="text-[11px] text-muted-foreground truncate mt-0.5">alex@example.com</p>
        </div>
      </div>

    </aside>
  )
}
