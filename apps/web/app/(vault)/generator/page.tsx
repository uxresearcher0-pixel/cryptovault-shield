"use client"

import React, { useState, useCallback, useRef } from 'react'
import { Copy, RefreshCw, Check, Clock, Shield, SlidersHorizontal, Zap } from 'lucide-react'
import { generatePassword, analyzePassword, strengthPercent, strengthLabel } from '@cryptovault/crypto-core'
import type { GeneratorOptions } from '@cryptovault/crypto-core'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

const STRENGTH_COLOR: Record<string, string> = {
  'very-weak':  '#ef4444',
  'weak':       '#f97316',
  'moderate':   '#f59e0b',
  'strong':     '#22c55e',
  'very-strong':'#10b981',
}

const STRENGTH_LABEL: Record<string, string> = {
  'very-weak':  'Very Weak',
  'weak':       'Weak',
  'moderate':   'Moderate',
  'strong':     'Strong',
  'very-strong':'Very Strong',
}

function timeAgo(d: Date): string {
  const secs = Math.floor((Date.now() - d.getTime()) / 1000)
  if (secs < 60) return `${secs}s ago`
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins} min ago`
  return `${Math.floor(mins / 60)}h ago`
}

interface HistoryEntry {
  password: string
  strength: string
  entropy: number
  at: Date
}

export default function GeneratorPage() {
  const [opts, setOpts] = useState<GeneratorOptions>({
    length: 20,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeAmbiguous: false,
  })
  const [generated, setGenerated] = useState('')
  const [copied, setCopied] = useState(false)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const generate = useCallback(() => {
    const p = generatePassword(opts)
    const a = analyzePassword(p)
    setGenerated(p)
    setHistory(prev => [
      { password: p, strength: a.strength, entropy: a.entropy, at: new Date() },
      ...prev.slice(0, 9),
    ])
    setCopied(false)
  }, [opts])

  const copy = async () => {
    if (!generated) return
    await navigator.clipboard.writeText(generated)
    setCopied(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setCopied(false), 2000)
  }

  const analysis = generated ? analyzePassword(generated) : null
  const entropyPct = analysis ? Math.min((analysis.entropy / 128) * 100, 100) : 0
  const strengthColor = analysis ? (STRENGTH_COLOR[analysis.strength] ?? '#f59e0b') : '#f59e0b'

  const toggle = (key: keyof GeneratorOptions) =>
    setOpts(prev => ({ ...prev, [key]: !prev[key] }))

  const activeCharsets = [opts.uppercase, opts.lowercase, opts.numbers, opts.symbols].filter(Boolean).length

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight">Password Generator</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Cryptographically secure password generation
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

        {/* ── Left column ─────────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Generated password card */}
          <div className="rounded-2xl border border-border/50 bg-card p-5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              Generated Password
            </p>

            {/* Password display */}
            <div className="rounded-xl border border-border/60 bg-secondary/30 px-4 py-4 min-h-[70px] flex items-center">
              {generated ? (
                <span className="font-mono text-base break-all text-foreground leading-relaxed">
                  {generated}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">
                  Click Regenerate to create a password
                </span>
              )}
            </div>

            {/* Entropy bar */}
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {analysis ? `${analysis.entropy.toFixed(1)} bits entropy` : 'Entropy'}
                </span>
                <span className="text-xs font-bold" style={{ color: strengthColor }}>
                  {analysis ? (STRENGTH_LABEL[analysis.strength] ?? 'Unknown') : '—'}
                </span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${entropyPct}%`, backgroundColor: strengthColor }}
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={generate}
                className="flex items-center justify-center gap-2 rounded-xl border border-border/60 bg-secondary/50 px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary/70 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Regenerate
              </button>
              <button
                onClick={copy}
                disabled={!generated}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
              >
                {copied
                  ? <><Check className="h-4 w-4" /> Copied!</>
                  : <><Copy className="h-4 w-4" /> Copy Password</>
                }
              </button>
            </div>
          </div>

          {/* Options card */}
          <div className="rounded-2xl border border-border/50 bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Options
              </p>
            </div>

            {/* Length slider */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Password Length</span>
                <span className="text-sm font-bold font-mono text-primary">{opts.length}</span>
              </div>
              <Slider
                value={[opts.length]}
                min={8}
                max={64}
                step={1}
                onValueChange={([v]) => setOpts(prev => ({ ...prev, length: v }))}
              />
              <div className="flex justify-between mt-1.5 text-[11px] text-muted-foreground">
                <span>8 min</span>
                <span className="text-amber-400">20 recommended</span>
                <span>64 max</span>
              </div>
            </div>

            {/* Character set toggles */}
            <div className="space-y-2">
              {([
                { key: 'uppercase',        label: 'Uppercase Letters',  sub: 'A-Z' },
                { key: 'lowercase',        label: 'Lowercase Letters',  sub: 'a-z' },
                { key: 'numbers',          label: 'Numbers',            sub: '0-9' },
                { key: 'symbols',          label: 'Symbols',            sub: '!@#$%^&*' },
                { key: 'excludeAmbiguous', label: 'Exclude Ambiguous',  sub: '0Ol1I' },
              ] as Array<{ key: keyof GeneratorOptions; label: string; sub: string }>).map(({ key, label, sub }) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-xl border border-border/40 bg-secondary/20 px-4 py-2.5"
                >
                  <div>
                    <span className="text-sm font-medium">{label}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{sub}</span>
                  </div>
                  <Switch
                    checked={!!opts[key]}
                    onCheckedChange={() => toggle(key)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right column ────────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Security Analysis card */}
          <div className="rounded-2xl border border-border/50 bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-4 w-4 text-primary shrink-0" />
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Security Analysis
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  label: 'Entropy',
                  value: analysis ? `${Math.round(analysis.entropy)} bits` : '— bits',
                  ok: analysis ? analysis.entropy >= 60 : false,
                },
                {
                  label: 'Brute Force Resistance',
                  value: analysis?.bruteForceTime ?? '—',
                  ok: analysis ? analysis.entropy >= 80 : false,
                },
                {
                  label: 'Character Diversity',
                  value: `${activeCharsets}/4 types`,
                  ok: activeCharsets >= 3,
                },
                {
                  label: 'Length',
                  value: `${opts.length} characters`,
                  ok: opts.length >= 16,
                },
              ].map(({ label, value, ok }) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-xl border border-border/40 bg-secondary/20 px-4 py-3"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: ok ? '#22c55e' : '#f97316' }}
                    />
                    <span className="text-sm text-muted-foreground">{label}</span>
                  </div>
                  <span className="text-sm font-semibold">{value}</span>
                </div>
              ))}
            </div>

            {analysis && (
              <div className="mt-4 flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                <p className="text-xs text-muted-foreground">
                  Avg crack time at 10¹² guesses/sec:{' '}
                  <span className="font-bold" style={{ color: strengthColor }}>{analysis.bruteForceTime}</span>
                </p>
              </div>
            )}
          </div>

          {/* Generation History */}
          <div className="rounded-2xl border border-border/50 bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Generation History
              </p>
              <span className="text-[11px] text-muted-foreground">Session only</span>
            </div>

            {history.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                <Clock className="h-8 w-8 text-muted-foreground/20" />
                <p className="text-sm">No history yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((h, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-xl border border-border/40 bg-secondary/20 px-3 py-2.5"
                  >
                    <span
                      className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold"
                      style={{
                        backgroundColor: `${STRENGTH_COLOR[h.strength] ?? '#f59e0b'}20`,
                        color: STRENGTH_COLOR[h.strength] ?? '#f59e0b',
                      }}
                    >
                      {STRENGTH_LABEL[h.strength] ?? 'Unknown'}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground truncate flex-1">
                      {h.password}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-muted-foreground">{timeAgo(h.at)}</span>
                      <button
                        onClick={() => navigator.clipboard.writeText(h.password)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
