"use client"

import React from 'react'
import {
  Shield,
  ShieldAlert,
  Users,
  TrendingUp,
  Download,
  CheckCircle,
  RefreshCw,
  Lock,
  Clock,
} from 'lucide-react'
import { useVault } from '@/contexts/vault-context'
import { scoreColor, scoreLabel } from '@cryptovault/crypto-core'
import { cn } from '@/lib/utils'

// ─── Avatar color (same formula as vault page) ────────────────────────────
const AVATAR_PALETTES = [
  'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-600',
  'bg-teal-500', 'bg-blue-500', 'bg-indigo-500', 'bg-violet-500',
  'bg-purple-500', 'bg-pink-500', 'bg-slate-600', 'bg-cyan-600',
]
function avatarColor(name: string): string {
  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return AVATAR_PALETTES[hash % AVATAR_PALETTES.length]
}

const STRENGTH_CONFIG: Record<string, { label: string; color: string }> = {
  'very-strong': { label: 'Very Strong', color: '#10b981' },
  'strong':      { label: 'Strong',      color: '#22c55e' },
  'moderate':    { label: 'Moderate',    color: '#f59e0b' },
  'weak':        { label: 'Weak',        color: '#f97316' },
  'very-weak':   { label: 'Very Weak',   color: '#ef4444' },
}

const STRENGTH_ORDER = ['very-weak', 'weak', 'moderate', 'strong', 'very-strong'] as const

const CHART_H = 160 // pixel height of vertical bar chart bars area

export default function ReportPage() {
  const { securityScore, vaultStats, credentials, alerts } = useVault()
  const { total } = securityScore

  const scoreClr = scoreColor(total)
  const breachedIds = new Set(alerts.filter(a => a.type === 'breach').map(a => a.credentialId))
  const passCounts = new Map<string, number>()
  credentials.forEach(c => passCounts.set(c.password, (passCounts.get(c.password) || 0) + 1))
  const reusedPasswords = new Set<string>()
  passCounts.forEach((count, pass) => { if (count > 1) reusedPasswords.add(pass) })

  const withMfa    = credentials.filter(c => c.mfaEnabled).length
  const withoutMfa = credentials.length - withMfa

  const strengthBreakdown = credentials.reduce<Record<string, number>>((acc, c) => {
    acc[c.strength] = (acc[c.strength] || 0) + 1
    return acc
  }, {})

  const maxCount   = Math.max(...STRENGTH_ORDER.map(k => strengthBreakdown[k] || 0), 1)
  const maxEntropy = Math.max(...credentials.map(c => c.entropy), 128)

  // Sorted credentials for entropy chart (highest first)
  const sortedByEntropy = [...credentials].sort((a, b) => b.entropy - a.entropy)

  const handleExport = () => {
    const rows = [
      ['Account', 'Strength', 'Entropy', 'MFA', 'Reused', 'Breached', 'Last Changed'],
      ...credentials.map(c => [
        c.site,
        STRENGTH_CONFIG[c.strength]?.label ?? c.strength,
        `${c.entropy.toFixed(1)} bits`,
        c.mfaEnabled ? 'Yes' : 'No',
        reusedPasswords.has(c.password) ? 'Yes' : 'No',
        breachedIds.has(c.id) ? 'Yes' : 'No',
        new Date(c.updatedAt).toLocaleDateString(),
      ]),
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'cryptovault-security-report.pdf'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Security Report</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Generated: {new Date().toLocaleDateString('en-US', { dateStyle: 'long' })} · {credentials.length} credentials analyzed
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span
            className="rounded-full border px-3 py-1.5 text-sm font-semibold"
            style={{ backgroundColor: `${scoreClr}15`, color: scoreClr, borderColor: `${scoreClr}40` }}
          >
            {scoreLabel(total)} · {total}/100
          </span>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-xl border border-border/60 bg-secondary/40 px-3 py-1.5 text-sm font-medium hover:bg-secondary/60 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* ── Stat cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: 'Security Score', value: `${total}`, subtitle: '/100',
            icon: TrendingUp, color: 'text-primary',
            iconBg: 'bg-primary/15', border: 'border-primary/30', cardBg: 'bg-primary/6',
          },
          {
            label: 'Weak Passwords', value: vaultStats.weak, subtitle: 'flagged',
            icon: ShieldAlert, color: 'text-orange-400',
            iconBg: 'bg-orange-500/15', border: 'border-orange-500/30', cardBg: 'bg-orange-500/6',
          },
          {
            label: 'Reused', value: vaultStats.reused, subtitle: 'passwords',
            icon: RefreshCw, color: 'text-amber-400',
            iconBg: 'bg-amber-500/15', border: 'border-amber-500/30', cardBg: 'bg-amber-500/6',
          },
          {
            label: 'Breached', value: vaultStats.breached, subtitle: 'credentials',
            icon: Shield, color: 'text-red-400',
            iconBg: 'bg-red-500/15', border: 'border-red-500/30', cardBg: 'bg-red-500/6',
          },
        ].map(({ label, value, subtitle, icon: Icon, color: c, iconBg, border, cardBg }) => (
          <div key={label} className={cn('rounded-2xl border px-5 py-4', border, cardBg)}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
                <p className={cn('text-4xl font-bold mt-2 tabular-nums', c)}>{value}</p>
                <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
              </div>
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', iconBg, c)}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

        {/* ── Vertical bar chart (entropy) ── */}
        <div className="lg:col-span-2 rounded-2xl border border-border/50 bg-card p-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Password Entropy by Account
          </p>

          {/* Chart */}
          <div
            className="relative flex items-stretch gap-2"
            style={{ height: `${CHART_H + 28}px` }}
          >
            {sortedByEntropy.map(c => {
              const barH  = Math.max(6, (c.entropy / maxEntropy) * CHART_H)
              const cfg   = STRENGTH_CONFIG[c.strength] ?? { color: '#6b7280', label: c.strength }
              return (
                <div
                  key={c.id}
                  className="flex flex-1 flex-col items-center justify-end gap-1 min-w-0"
                >
                  <span
                    className="text-[9px] font-mono leading-none shrink-0"
                    style={{ color: cfg.color }}
                  >
                    {Math.round(c.entropy)}
                  </span>
                  <div
                    className="w-full rounded-t-md shrink-0 transition-all duration-700"
                    style={{ height: `${barH}px`, backgroundColor: cfg.color }}
                  />
                </div>
              )
            })}

            {/* 80-bit threshold dashed line */}
            <div
              className="absolute left-0 right-0 border-t border-dashed border-muted-foreground/30 pointer-events-none"
              style={{ bottom: `${(80 / maxEntropy) * CHART_H + 16}px` }}
            />
          </div>

          {/* X-axis labels */}
          <div className="flex gap-2 mt-1">
            {sortedByEntropy.map(c => (
              <div key={c.id} className="flex-1 text-center min-w-0">
                <span className="text-[9px] text-muted-foreground block truncate leading-tight">
                  {c.site.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-center text-muted-foreground mt-2">
            Minimum recommended: 80 bits
          </p>
        </div>

        {/* ── MFA coverage ring ── */}
        <div className="rounded-2xl border border-border/50 bg-card p-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            MFA Coverage
          </p>
          <div className="flex flex-col items-center gap-4">
            <div className="relative shrink-0">
              <svg width="100" height="100" className="-rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor"
                  strokeWidth="10" className="text-red-500/30" />
                <circle cx="50" cy="50" r="40" fill="none"
                  stroke="#22c55e" strokeWidth="10"
                  strokeDasharray={`${(withMfa / Math.max(credentials.length, 1)) * 251} 251`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-primary">{withMfa}</span>
              </div>
            </div>
            <div className="w-full space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                  <span className="text-sm">With MFA</span>
                </div>
                <span className="text-sm font-bold text-primary">{withMfa}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <span className="text-sm">Without MFA</span>
                </div>
                <span className="text-sm font-bold text-red-400">{withoutMfa}</span>
              </div>
              <div className="h-px bg-border/40" />
              <p className="text-xs text-muted-foreground">
                {Math.round((withMfa / Math.max(credentials.length, 1)) * 100)}% of accounts protected
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Strength distribution — colored blocks ──────────────────────── */}
      <div className="rounded-2xl border border-border/50 bg-card p-5">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-5">
          Strength Distribution
        </p>
        <div className="flex items-end justify-between gap-4">
          {STRENGTH_ORDER.map(key => {
            const cfg   = STRENGTH_CONFIG[key]!
            const count = strengthBreakdown[key] || 0
            const blockH = count === 0 ? 6 : Math.max(16, (count / maxCount) * 64)
            return (
              <div key={key} className="flex flex-1 flex-col items-center gap-2">
                {/* Colored block — height proportional to count */}
                <div
                  className="w-full rounded-lg transition-all duration-700"
                  style={{
                    height: `${blockH}px`,
                    backgroundColor: cfg.color,
                    opacity: count === 0 ? 0.25 : 1,
                  }}
                />
                {/* Count */}
                <span
                  className="text-2xl font-bold tabular-nums"
                  style={{ color: cfg.color }}
                >
                  {count}
                </span>
                {/* Label */}
                <span className="text-[10px] text-muted-foreground text-center leading-tight">
                  {cfg.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Credential audit table ─────────────────────────────────────── */}
      <div className="rounded-2xl border border-border/50 bg-card p-5">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">
          Detailed Credential Audit
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40">
                {['Account', 'Strength', 'Entropy', 'MFA', 'Reused', 'Breached', 'Last Changed'].map(h => (
                  <th key={h} className="pb-3 pr-4 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {credentials.map(c => {
                const isReused   = reusedPasswords.has(c.password)
                const isBreached = breachedIds.has(c.id)
                const cfg        = STRENGTH_CONFIG[c.strength] ?? { label: c.strength, color: '#6b7280' }
                return (
                  <tr key={c.id} className="hover:bg-secondary/20 transition-colors">

                    {/* Account */}
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white',
                          avatarColor(c.site),
                        )}>
                          {c.site.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{c.site}</p>
                          <p className="text-xs text-muted-foreground truncate">{c.username}</p>
                        </div>
                      </div>
                    </td>

                    {/* Strength */}
                    <td className="py-3 pr-4">
                      <span className="text-sm font-semibold" style={{ color: cfg.color }}>
                        {cfg.label}
                      </span>
                    </td>

                    {/* Entropy */}
                    <td className="py-3 pr-4">
                      <span className="font-mono text-xs text-muted-foreground">{c.entropy.toFixed(1)}</span>
                    </td>

                    {/* MFA */}
                    <td className="py-3 pr-4">
                      {c.mfaEnabled
                        ? <CheckCircle className="h-4 w-4 text-primary" />
                        : <ShieldAlert className="h-4 w-4 text-orange-400" />
                      }
                    </td>

                    {/* Reused */}
                    <td className="py-3 pr-4">
                      {isReused ? (
                        <div className="flex items-center gap-1.5">
                          <RefreshCw className="h-3.5 w-3.5 text-amber-400" />
                          <span className="text-xs font-semibold text-amber-400">Yes</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">No</span>
                      )}
                    </td>

                    {/* Breached */}
                    <td className="py-3 pr-4">
                      {isBreached ? (
                        <div className="flex items-center gap-1.5">
                          <ShieldAlert className="h-3.5 w-3.5 text-red-400" />
                          <span className="text-xs font-semibold text-red-400">Yes</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">No</span>
                      )}
                    </td>

                    {/* Last Changed */}
                    <td className="py-3">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="h-3 w-3 shrink-0" />
                        <span className="text-xs">
                          {new Date(c.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Zero-knowledge note ─────────────────────────────────────────── */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4 flex items-center gap-3">
        <Lock className="h-5 w-5 text-primary shrink-0" />
        <div>
          <p className="text-sm font-semibold text-primary">Zero-Knowledge Architecture</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            All credentials are encrypted client-side with AES-256-GCM before storage.
            Your master password never leaves your device.
          </p>
        </div>
      </div>

    </div>
  )
}
