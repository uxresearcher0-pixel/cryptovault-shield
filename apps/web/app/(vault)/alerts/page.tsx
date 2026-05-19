"use client"

import React, { useState } from 'react'
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  ShieldX,
  RefreshCw,
  Key,
  Clock,
  Globe,
  Shield,
  X,
} from 'lucide-react'
import type { AlertType, AlertSeverity } from '@cryptovault/crypto-core'
import { useVault } from '@/contexts/vault-context'
import { cn } from '@/lib/utils'

const ALERT_ICONS: Record<AlertType, React.ElementType> = {
  breach:   ShieldX,
  reuse:    RefreshCw,
  weak:     Key,
  expired:  Clock,
  phishing: Globe,
  mfa:      Shield,
}

const SEVERITY: Record<AlertSeverity, { color: string; bg: string; border: string; dot: string; label: string }> = {
  critical: { color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/30',    dot: 'bg-red-500',    label: 'CRITICAL' },
  high:     { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', dot: 'bg-orange-500', label: 'HIGH'     },
  medium:   { color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/30',  dot: 'bg-amber-500',  label: 'WARNING'  },
  low:      { color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/30',   dot: 'bg-blue-500',   label: 'INFO'     },
}

type Tab = 'all' | 'critical' | 'warning' | 'info'

export default function AlertsPage() {
  const { alerts, resolveAlert } = useVault()
  const [tab, setTab] = useState<Tab>('all')

  const active = alerts.filter(a => !a.resolved)

  const critCount  = active.filter(a => a.severity === 'critical').length
  const highCount  = active.filter(a => a.severity === 'high').length
  const warnCount  = active.filter(a => a.severity === 'medium').length
  const infoCount  = active.filter(a => a.severity === 'low').length
  const criticalTotal = critCount + highCount

  const filtered = alerts.filter(a => {
    if (tab === 'all') return true
    if (tab === 'critical') return !a.resolved && (a.severity === 'critical' || a.severity === 'high')
    if (tab === 'warning')  return !a.resolved && a.severity === 'medium'
    if (tab === 'info')     return !a.resolved && a.severity === 'low'
    return true
  })

  const resolveAll = () => {
    active.forEach(a => resolveAlert(a.id))
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Security Alerts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {active.length} active alerts · {critCount} critical · {highCount} high
          </p>
        </div>
        {active.length > 0 && (
          <button
            onClick={resolveAll}
            className="flex items-center gap-2 rounded-xl border border-border/60 bg-secondary/40 px-3 py-1.5 text-sm font-medium hover:bg-secondary/60 transition-colors"
          >
            <CheckCircle className="h-4 w-4" />
            Clear all
          </button>
        )}
      </div>

      {/* Critical banner */}
      {criticalTotal > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <ShieldX className="h-5 w-5 text-red-400 shrink-0" />
          <p className="text-sm text-red-400 font-medium">
            {criticalTotal} critical threat{criticalTotal > 1 ? 's' : ''} detected — immediate action required
          </p>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-1.5 rounded-xl border border-border/40 bg-secondary/20 p-1 w-fit">
        {([
          { id: 'all',      label: 'All',      count: active.length  },
          { id: 'critical', label: 'Critical', count: criticalTotal  },
          { id: 'warning',  label: 'Warning',  count: warnCount      },
          { id: 'info',     label: 'Info',     count: infoCount      },
        ] as Array<{ id: Tab; label: string; count: number }>).map(({ id, label, count }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
              tab === id
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {label}
            {count > 0 && (
              <span
                className={cn(
                  'flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold',
                  tab === id ? 'bg-primary/15 text-primary' : 'bg-secondary text-muted-foreground',
                )}
              >
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Alert list */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground rounded-2xl border border-border/50 bg-card">
            <CheckCircle className="h-12 w-12 text-primary/20" />
            <p className="text-sm font-medium">No alerts in this category</p>
            <p className="text-xs">Your vault looks secure</p>
          </div>
        ) : (
          filtered.map(alert => {
            const Icon = ALERT_ICONS[alert.type]
            const cfg  = SEVERITY[alert.severity]
            return (
              <div
                key={alert.id}
                className={cn(
                  'flex items-start gap-4 rounded-2xl border p-4 transition-all',
                  alert.resolved
                    ? 'border-border/30 bg-card/50 opacity-50'
                    : 'border-border/50 bg-card hover:border-border/80',
                )}
              >
                {/* Icon */}
                <div className={cn('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', cfg.bg, cfg.border, 'border')}>
                  <Icon className={cn('h-4 w-4', cfg.color)} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <p className="text-sm font-semibold leading-snug flex-1 min-w-0">{alert.title}</p>
                    <span className={cn(
                      'shrink-0 rounded px-2 py-0.5 text-[10px] font-bold border',
                      cfg.bg, cfg.border, cfg.color,
                    )}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{alert.message}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(alert.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                    {alert.resolved && (
                      <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-bold text-primary">
                        <CheckCircle className="h-3 w-3" /> Resolved
                      </span>
                    )}
                  </div>
                </div>

                {/* Dismiss */}
                {!alert.resolved && (
                  <button
                    onClick={() => resolveAlert(alert.id)}
                    className="shrink-0 mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                    title="Resolve"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )
          })
        )}
      </div>

    </div>
  )
}
