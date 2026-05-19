"use client"

import React from 'react'
import Link from 'next/link'
import {
  Shield,
  AlertTriangle,
  RefreshCw,
  ShieldAlert,
  Users,
  ShieldX,
  TrendingUp,
  Clock,
  Globe,
  Key,
  ChevronRight,
  Zap,
} from 'lucide-react'
import { useVault } from '@/contexts/vault-context'
import { scoreColor, scoreLabel } from '@cryptovault/crypto-core'
import { cn } from '@/lib/utils'

// ─── Relative time ────────────────────────────────────────────────────────
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

// ─── Score ring (compact) ─────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const r = 44
  const circ = 2 * Math.PI * r
  const filled = (score / 100) * circ
  const color = scoreColor(score)
  return (
    <div className="relative flex items-center justify-center shrink-0">
      <svg width="120" height="120" className="-rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="currentColor"
          strokeWidth="10" className="text-secondary" />
        <circle cx="60" cy="60" r={r} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={`${filled} ${circ}`} strokeLinecap="round"
          className="transition-all duration-700"
          style={{ filter: `drop-shadow(0 0 6px ${color}55)` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center select-none">
        <span className="text-3xl font-bold tabular-nums leading-none" style={{ color }}>{score}</span>
        <span className="text-[11px] text-muted-foreground">/100</span>
      </div>
    </div>
  )
}

// ─── Inline strength bar ─────────────────────────────────────────────────
function InlineBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-32 shrink-0 text-xs text-muted-foreground">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
      <span className="w-6 shrink-0 text-right text-xs font-semibold tabular-nums" style={{ color }}>{value}</span>
    </div>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────
function StatCard({
  label, value, subtitle, icon: Icon, valueColor, iconBg, href, cardClass,
}: {
  label: string; value: number; subtitle: string
  icon: React.ElementType; valueColor: string; iconBg: string; href?: string; cardClass?: string
}) {
  const inner = (
    <div className={cn(
      'flex flex-col justify-between h-full rounded-2xl border px-5 py-4 transition-colors cursor-pointer',
      cardClass ?? 'border-border/50 bg-card hover:border-border/80',
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className={cn('text-4xl font-bold mt-1 tabular-nums', valueColor)}>{value}</p>
        </div>
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', iconBg)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>
    </div>
  )
  return href ? <Link href={href} className="block">{inner}</Link> : inner
}

// ─── Event icon ───────────────────────────────────────────────────────────
function EventIcon({ type }: { type: string }) {
  const map: Record<string, { icon: React.ElementType; cls: string }> = {
    breach: { icon: Shield, cls: 'text-red-400' },
    phishing: { icon: Globe, cls: 'text-red-400' },
    reuse: { icon: RefreshCw, cls: 'text-amber-400' },
    weak: { icon: Key, cls: 'text-amber-400' },
    mfa: { icon: Shield, cls: 'text-blue-400' },
    expired: { icon: Clock, cls: 'text-orange-400' },
  }
  const m = map[type] ?? { icon: AlertTriangle, cls: 'text-muted-foreground' }
  return <m.icon className={cn('h-4 w-4 shrink-0 mt-0.5', m.cls)} />
}

// ─── Severity pill ────────────────────────────────────────────────────────
function SeverityPill({ severity }: { severity: string }) {
  const styles: Record<string, string> = {
    critical: 'bg-red-500/15 text-red-400 border border-red-500/30',
    high:     'bg-orange-500/15 text-orange-400 border border-orange-500/30',
    medium:   'bg-amber-500/15 text-amber-500 border border-amber-500/30',
    low:      'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  }
  const labels: Record<string, string> = {
    critical: 'CRITICAL', high: 'HIGH', medium: 'WARNING', low: 'INFO',
  }
  return (
    <span className={cn('shrink-0 rounded px-2 py-0.5 text-[10px] font-bold tracking-wide', styles[severity] ?? styles.low)}>
      {labels[severity] ?? severity.toUpperCase()}
    </span>
  )
}

const BREAKDOWN_META: Record<string, { label: string; weight: string }> = {
  entropy:    { label: 'Password Entropy',    weight: '25%' },
  uniqueness: { label: 'Uniqueness',          weight: '20%' },
  mfa:        { label: 'MFA Coverage',        weight: '15%' },
  breach:     { label: 'Breach Safety',       weight: '10%' },
  phishing:   { label: 'Phishing Safety',     weight: '20%' },
  age:        { label: 'Password Age',        weight: '10%' },
}

const BREAKDOWN_ORDER = ['entropy', 'uniqueness', 'mfa', 'breach', 'phishing', 'age']

function barColor(v: number): string {
  if (v >= 75) return '#22c55e'
  if (v >= 55) return '#f59e0b'
  return '#f97316'
}

// ─── Main page ────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { securityScore, vaultStats, alerts, events, credentials } = useVault()
  const { total, breakdown } = securityScore
  const activeAlerts = alerts.filter(a => !a.resolved)
  const recentEvents = activeAlerts.slice(0, 5)

  const inlineBreakdownKeys = ['entropy', 'uniqueness', 'mfa'] as const

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">

      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Security Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Last scan: {events.length > 0 ? relativeTime(new Date(events[0].timestamp)) : 'just now'} · {credentials.length} credentials monitored
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-primary/10 border border-primary/25 px-3 py-1.5 shrink-0">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-semibold text-primary">Vault Active</span>
        </div>
      </div>

      {/* ── Row 1: Score card + stat cards ────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">

        {/* Overall Security Score */}
        <div className="lg:col-span-2 rounded-2xl border border-border/50 bg-card p-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Overall Security Score
          </p>
          <div className="flex items-center gap-5">
            <ScoreRing score={total} />
            <div className="flex-1 space-y-2.5 min-w-0">
              {inlineBreakdownKeys.map(key => {
                const val = breakdown[key] ?? 0
                return (
                  <InlineBar
                    key={key}
                    label={BREAKDOWN_META[key]?.label ?? key}
                    value={val}
                    color={barColor(val)}
                  />
                )
              })}
            </div>
          </div>
          {/* Score improvement note */}
          <div className="mt-4 flex items-center gap-2 text-xs text-primary">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Score improved <strong>+4 pts</strong> this week</span>
          </div>
        </div>

        {/* 2×2 stat cards */}
        <div className="lg:col-span-3 grid grid-cols-2 gap-3">
          <StatCard
            label="Weak Passwords"
            value={vaultStats.weak}
            subtitle="Below 60-bit entropy"
            icon={ShieldAlert}
            valueColor="text-orange-400"
            iconBg="bg-orange-500/15 text-orange-400"
            href="/vault"
            cardClass="border-orange-500/30 bg-orange-500/6 hover:border-orange-500/50"
          />
          <StatCard
            label="Reused Passwords"
            value={vaultStats.reused}
            subtitle="Shared across accounts"
            icon={RefreshCw}
            valueColor="text-amber-400"
            iconBg="bg-amber-500/15 text-amber-400"
            href="/vault"
            cardClass="border-amber-500/30 bg-amber-500/6 hover:border-amber-500/50"
          />
          <StatCard
            label="Breached Creds"
            value={vaultStats.breached}
            subtitle="Found in data leaks"
            icon={ShieldX}
            valueColor="text-red-400"
            iconBg="bg-red-500/15 text-red-400"
            cardClass="border-red-500/30 bg-red-500/6 hover:border-red-500/50"
          />
          <StatCard
            label="MFA Missing"
            value={vaultStats.noMfa}
            subtitle="Unprotected accounts"
            icon={Users}
            valueColor="text-blue-400"
            iconBg="bg-blue-500/15 text-blue-400"
            cardClass="border-blue-500/30 bg-blue-500/6 hover:border-blue-500/50"
          />
        </div>
      </div>

      {/* ── Row 2: Score breakdown + Recent events ─────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        {/* Score breakdown */}
        <div className="rounded-2xl border border-border/50 bg-card p-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Score Breakdown
          </p>
          <div className="space-y-3">
            {BREAKDOWN_ORDER.map(key => {
              const val = (breakdown as Record<string, number>)[key] ?? 0
              const meta = BREAKDOWN_META[key]
              if (!meta) return null
              const color = barColor(val)
              return (
                <div key={key} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{meta.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">Weight: {meta.weight}</span>
                      <span className="text-sm font-bold tabular-nums" style={{ color }}>
                        {val}/100
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${val}%`, backgroundColor: color }} />
                  </div>
                </div>
              )
            })}
          </div>
          <p className="mt-4 text-[10px] text-muted-foreground font-mono">
            Formula: 0.25E + 0.20U + 0.10A + 0.15M + 0.20P + 0.10B
          </p>
        </div>

        {/* Recent security events */}
        <div className="rounded-2xl border border-border/50 bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Recent Security Events
            </p>
            <Link href="/alerts"
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors">
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-0">
            {recentEvents.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10 text-muted-foreground">
                <Shield className="h-10 w-10 text-primary/20" />
                <p className="text-sm">No active security events</p>
              </div>
            ) : (
              recentEvents.map((alert, i) => (
                <div key={alert.id}>
                  <div className="flex items-start gap-3 py-3">
                    <EventIcon type={alert.type} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-snug">{alert.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[11px] text-muted-foreground">
                          {relativeTime(new Date(alert.createdAt))}
                        </span>
                      </div>
                    </div>
                    <SeverityPill severity={alert.severity} />
                  </div>
                  {i < recentEvents.length - 1 && (
                    <div className="h-px bg-border/40" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Quick actions ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Add Credential',    href: '/vault',     icon: Key,           cls: 'text-primary' },
          { label: 'Generate Password', href: '/generator', icon: Zap,           cls: 'text-amber-400' },
          { label: 'Check URL',         href: '/phishing',  icon: Globe,         cls: 'text-blue-400' },
          { label: 'View Alerts',       href: '/alerts',    icon: AlertTriangle, cls: 'text-orange-400' },
        ].map(({ label, href, icon: Icon, cls }) => (
          <Link key={href} href={href}>
            <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-card px-4 py-3 hover:border-border hover:bg-secondary/30 transition-all cursor-pointer">
              <Icon className={cn('h-4 w-4 shrink-0', cls)} />
              <span className="text-sm font-medium">{label}</span>
            </div>
          </Link>
        ))}
      </div>

    </div>
  )
}
