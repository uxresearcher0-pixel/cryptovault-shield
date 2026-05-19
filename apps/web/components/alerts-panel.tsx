"use client"

import React, { useState } from 'react'
import { Shield, X, Bell, ShieldAlert, RefreshCw, Globe, Key, Lock, Clock } from 'lucide-react'
import { useVault } from '@/contexts/vault-context'
import { cn } from '@/lib/utils'

function relativeTime(date: Date): string {
  const secs = Math.floor((Date.now() - date.getTime()) / 1000)
  if (secs < 60) return 'just now'
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

function AlertTypeIcon({ type }: { type: string }) {
  const map: Record<string, { icon: React.ElementType; cls: string }> = {
    breach:   { icon: ShieldAlert, cls: 'text-red-400' },
    phishing: { icon: Globe,       cls: 'text-red-400' },
    reuse:    { icon: RefreshCw,   cls: 'text-amber-400' },
    weak:     { icon: Key,         cls: 'text-amber-400' },
    mfa:      { icon: Shield,      cls: 'text-blue-400' },
    expired:  { icon: Clock,       cls: 'text-orange-400' },
  }
  const m = map[type] ?? { icon: Lock, cls: 'text-muted-foreground' }
  return <m.icon className={cn('h-4 w-4 shrink-0', m.cls)} />
}

type Filter = 'all' | 'critical' | 'warning' | 'info'

const SEV_CONFIG: Record<string, { dot: string; pill: string; label: string }> = {
  critical: { dot: 'bg-red-500',    pill: 'bg-red-500/15 text-red-400 border-red-500/30',    label: 'CRITICAL' },
  high:     { dot: 'bg-orange-500', pill: 'bg-orange-500/15 text-orange-400 border-orange-500/30', label: 'HIGH' },
  medium:   { dot: 'bg-amber-500',  pill: 'bg-amber-500/15 text-amber-400 border-amber-500/30',  label: 'WARNING' },
  low:      { dot: 'bg-blue-500',   pill: 'bg-blue-500/15 text-blue-400 border-blue-500/30',   label: 'INFO' },
}

export function AlertsPanel({ onClose }: { onClose: () => void }) {
  const { alerts, resolveAlert } = useVault()
  const [filter, setFilter] = useState<Filter>('all')

  const active = alerts.filter(a => !a.resolved)
  const criticalList = active.filter(a => a.severity === 'critical')
  const warningList  = active.filter(a => a.severity === 'high' || a.severity === 'medium')
  const infoList     = active.filter(a => a.severity === 'low')

  const filtered =
    filter === 'critical' ? criticalList :
    filter === 'warning'  ? warningList  :
    filter === 'info'     ? infoList     : active

  const tabs: Array<{ id: Filter; label: string; count: number }> = [
    { id: 'all',      label: 'All',      count: active.length },
    { id: 'critical', label: 'Critical', count: criticalList.length },
    { id: 'warning',  label: 'Warning',  count: warningList.length },
    { id: 'info',     label: 'Info',     count: infoList.length },
  ]

  // Top critical alert for banner
  const topCritical = criticalList[0] ?? null

  const resolveAll = () => active.forEach(a => resolveAlert(a.id))

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 z-50 flex h-full w-[420px] flex-col bg-card border-l border-border/60 shadow-2xl animate-in slide-in-from-right duration-200">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 shrink-0">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold leading-none">Security Alerts</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{active.length} active alerts</p>
          </div>
          {active.length > 0 && (
            <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white shrink-0">
              {active.length}
            </span>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Critical banner ─────────────────────────────────────────── */}
        {topCritical && (
          <div className="mx-4 mt-3 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 shrink-0">
            <ShieldAlert className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-red-400 uppercase tracking-wide">Critical Alert</p>
              <p className="text-xs text-red-300/90 mt-0.5 leading-relaxed line-clamp-2">
                {topCritical.title}
              </p>
            </div>
          </div>
        )}

        {/* ── Filter tabs ─────────────────────────────────────────────── */}
        <div className="flex gap-1 px-4 pt-3 pb-1 shrink-0 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors',
                filter === tab.id
                  ? 'bg-primary/15 text-primary border border-primary/25'
                  : 'text-muted-foreground hover:text-foreground border border-transparent hover:bg-secondary/50',
              )}
            >
              {tab.label}
              <span className={cn(
                'rounded-full px-1.5 py-0.5 text-[10px] font-bold min-w-[18px] text-center',
                filter === tab.id ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground',
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* ── Alert list ──────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
              <Bell className="h-10 w-10 opacity-20" />
              <p className="text-sm">No alerts in this category</p>
            </div>
          ) : (
            filtered.map(alert => {
              const cfg = SEV_CONFIG[alert.severity] ?? SEV_CONFIG.low
              return (
                <div
                  key={alert.id}
                  className="rounded-xl border border-border/40 bg-secondary/15 px-4 py-3"
                >
                  <div className="flex items-start gap-3">
                    <AlertTypeIcon type={alert.type} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-1">
                        <p className="text-sm font-semibold leading-snug flex-1">{alert.title}</p>
                        <span className={cn(
                          'shrink-0 rounded border px-2 py-0.5 text-[10px] font-bold tracking-wide',
                          cfg.pill,
                        )}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{alert.message}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[11px] text-muted-foreground">
                          {relativeTime(new Date(alert.createdAt))}
                        </span>
                        <button
                          onClick={() => resolveAlert(alert.id)}
                          className="text-[11px] text-primary hover:text-primary/70 font-semibold transition-colors"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* ── Footer ──────────────────────────────────────────────────── */}
        <div className="border-t border-border/50 px-4 py-3 shrink-0">
          <button
            onClick={resolveAll}
            disabled={active.length === 0}
            className="w-full rounded-xl border border-border/50 bg-secondary/30 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors disabled:opacity-40"
          >
            Clear all alerts
          </button>
        </div>
      </div>
    </>
  )
}
