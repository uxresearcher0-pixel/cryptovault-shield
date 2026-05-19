"use client"

import React, { useState } from 'react'
import { Globe, Search, ShieldCheck, ShieldX, ShieldAlert, Clock, AlertTriangle } from 'lucide-react'
import { analyzeURL } from '@cryptovault/threat-engine'
import type { PhishingResult } from '@cryptovault/threat-engine'
import { useVault } from '@/contexts/vault-context'
import { cn } from '@/lib/utils'

const SIGNALS = [
  { label: 'Lookalike domain',     points: '+30', key: 'lookalike'    },
  { label: 'Domain mismatch',      points: '+25', key: 'mismatch'     },
  { label: 'IP address URL',       points: '+30', key: 'ip'           },
  { label: 'Punycode / IDN',       points: '+20', key: 'punycode'     },
  { label: '@ symbol in URL',      points: '+20', key: 'at'           },
  { label: 'Insecure HTTP',        points: '+15', key: 'http'         },
  { label: 'URL shortener',        points: '+15', key: 'shortener'    },
  { label: 'Suspicious keyword',   points: '+10', key: 'keyword'      },
  { label: 'Excess subdomains',    points: '+10', key: 'subdomains'   },
  { label: 'Redirect chain',       points: '+10', key: 'redirect'     },
  { label: 'Long URL (>100 chars)',points: '+5',  key: 'long'         },
  { label: 'Invalid URL format',   points: '+50', key: 'invalid'      },
]

type HistoryItem = PhishingResult

export default function PhishingPage() {
  const { credentials } = useVault()
  const [url, setUrl] = useState('')
  const [expectedDomain, setExpectedDomain] = useState('')
  const [result, setResult] = useState<PhishingResult | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>(() =>
    [
      'http://netfl1x-login.com/login',
      'https://github.com',
      'http://paypa1.com/verify',
      'https://bit.ly/3xYz9k',
      'https://google.com',
    ].map(u => analyzeURL(u)),
  )
  const [loading, setLoading] = useState(false)

  const doAnalyze = (targetUrl: string) => {
    if (!targetUrl.trim()) return
    setLoading(true)
    setTimeout(() => {
      const r = analyzeURL(targetUrl.trim(), expectedDomain.trim() || undefined)
      setResult(r)
      setHistory(prev => [r, ...prev.slice(0, 9)])
      setLoading(false)
    }, 400)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    doAnalyze(url)
  }

  const credDomains = credentials
    .filter(c => c.url)
    .map(c => { try { return new URL(c.url!).hostname } catch { return null } })
    .filter(Boolean) as string[]

  // Determine which signals were triggered based on result details
  function isTriggered(signalKey: string): boolean {
    if (!result) return false
    const detail = result.details.join(' ').toLowerCase()
    const labelMap: Record<string, string[]> = {
      lookalike: ['lookalike', 'similar to', 'resembles'],
      mismatch: ['mismatch', 'expected domain'],
      ip: ['ip address', 'ip-based'],
      punycode: ['punycode', 'idn', 'unicode'],
      at: ['@ symbol', 'contains @'],
      http: ['http', 'insecure'],
      shortener: ['shortener', 'url shortener', 'short link'],
      keyword: ['keyword', 'suspicious keyword', 'phishing keyword'],
      subdomains: ['subdomain', 'excess subdomain'],
      redirect: ['redirect'],
      long: ['long url', 'url length'],
      invalid: ['invalid'],
    }
    const terms = labelMap[signalKey] ?? []
    return terms.some(t => detail.includes(t))
  }

  const isBlock = result?.decision === 'BLOCK'
  const isWarn  = result?.decision === 'WARN'
  const isAllow = result?.decision === 'ALLOW'

  const resultConfig = result ? {
    BLOCK: { icon: ShieldX,     color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/30',         label: 'BLOCKED — Autofill Blocked',       score_color: '#ef4444' },
    WARN:  { icon: ShieldAlert, color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/30',     label: 'WARNING — Suspicious URL',          score_color: '#f59e0b' },
    ALLOW: { icon: ShieldCheck, color: 'text-primary',     bg: 'bg-primary/10 border-primary/30',         label: 'SAFE — Autofill Allowed',           score_color: '#22c55e' },
  }[result.decision] : null

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight">URL Phishing Analyzer</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Analyze any URL for phishing risk before submitting credentials
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

        {/* ── Left column ─────────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* URL Analysis form */}
          <div className="rounded-2xl border border-border/50 bg-card p-5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              URL Analysis
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  URL to analyze
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://example.com/login"
                  className="w-full rounded-xl border border-border/60 bg-secondary/30 px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Expected domain <span className="text-muted-foreground/60">(optional — stricter check)</span>
                </label>
                <input
                  type="text"
                  list="vault-domains"
                  value={expectedDomain}
                  onChange={e => setExpectedDomain(e.target.value)}
                  placeholder="chase.com"
                  className="w-full rounded-xl border border-border/60 bg-secondary/30 px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <datalist id="vault-domains">
                  {credDomains.map(d => <option key={d} value={d} />)}
                </datalist>
              </div>
              <button
                type="submit"
                disabled={!url.trim() || loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading
                  ? <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  : <Search className="h-4 w-4" />
                }
                Analyze URL
              </button>
            </form>

            {/* Example URLs */}
            <div className="mt-4">
              <p className="text-[11px] text-muted-foreground mb-2 font-medium">Quick examples:</p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: '✓ Google', url: 'https://accounts.google.com/login' },
                  { label: '⚠ Chase lookalike', url: 'http://ch4se-bank-secure.com/login' },
                  { label: '✗ PayPal phish', url: 'http://paypa1-secure-login.com/verify' },
                ].map(({ label, url: exUrl }) => (
                  <button
                    key={exUrl}
                    onClick={() => { setUrl(exUrl); doAnalyze(exUrl) }}
                    className="text-xs rounded-lg border border-border/40 bg-secondary/20 hover:bg-secondary/40 px-2.5 py-1 transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Result card */}
          {result && resultConfig && (() => {
            const Icon = resultConfig.icon
            return (
              <div className={cn('rounded-2xl border p-5 space-y-4', resultConfig.bg)}>
                {/* Decision header */}
                <div className="flex items-center gap-3">
                  <Icon className={cn('h-6 w-6 shrink-0', resultConfig.color)} />
                  <div className="flex-1 min-w-0">
                    <p className={cn('font-semibold', resultConfig.color)}>{resultConfig.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{result.url}</p>
                  </div>
                  <div
                    className="shrink-0 rounded-full px-3 py-1 text-xs font-bold border"
                    style={{
                      backgroundColor: `${resultConfig.score_color}20`,
                      color: resultConfig.score_color,
                      borderColor: `${resultConfig.score_color}40`,
                    }}
                  >
                    {result.score}/100
                  </div>
                </div>

                {/* Score bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0 — Safe</span>
                    <span>40 — Warn</span>
                    <span>70 — Block</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary/50 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${result.score}%`, backgroundColor: resultConfig.score_color }}
                    />
                  </div>
                </div>

                {/* Detected signals */}
                {result.details.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                      Signals Detected
                    </p>
                    <div className="space-y-1.5">
                      {result.details.map((d, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs">
                          <AlertTriangle className={cn('h-3.5 w-3.5 shrink-0 mt-0.5', resultConfig.color)} />
                          <span>{d}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-[11px] text-muted-foreground">
                  Scanned {new Date(result.checkedAt).toLocaleTimeString()}
                </p>
              </div>
            )
          })()}

          {/* Risk signal breakdown */}
          <div className="rounded-2xl border border-border/50 bg-card p-5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              Risk Signal Breakdown
            </p>
            <div className="space-y-2">
              {SIGNALS.map(s => {
                const triggered = result ? isTriggered(s.key) : false
                return (
                  <div
                    key={s.key}
                    className={cn(
                      'flex items-center justify-between rounded-xl px-3 py-2.5 border transition-colors',
                      triggered
                        ? 'border-red-500/30 bg-red-500/10'
                        : 'border-border/30 bg-secondary/20',
                    )}
                  >
                    <span className={cn('text-xs', triggered ? 'text-red-400' : 'text-muted-foreground')}>
                      {s.label}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-mono text-red-400">{s.points}</span>
                      {triggered && (
                        <span className="text-[10px] font-bold text-red-400 uppercase tracking-wide">
                          TRIGGERED
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Right column ────────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Phishing Score Formula */}
          <div className="rounded-2xl border border-border/50 bg-card p-5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              Phishing Score Formula
            </p>
            <div className="space-y-3">
              {/* Code-style formula */}
              <div className="rounded-xl bg-secondary/40 border border-border/40 px-4 py-3">
                <p className="font-mono text-sm text-primary text-center tracking-wide">
                  PhishingScore = D + L + P + K + S + R + B
                </p>
              </div>
              {/* Variable definitions */}
              <div className="space-y-1.5">
                {[
                  { var: 'D', desc: 'Domain lookalike / Levenshtein distance',  pts: '+30' },
                  { var: 'L', desc: 'Long or malformed URL structure',           pts: '+5'  },
                  { var: 'P', desc: 'Punycode / IDN homoglyph encoding',         pts: '+20' },
                  { var: 'K', desc: 'Suspicious keyword in path or subdomain',   pts: '+10' },
                  { var: 'S', desc: 'Insecure HTTP scheme (no TLS)',              pts: '+15' },
                  { var: 'R', desc: 'Redirect chain or URL shortener detected',  pts: '+15' },
                  { var: 'B', desc: 'Bare IP address or invalid URL format',     pts: '+50' },
                ].map(({ var: v, desc, pts }) => (
                  <div key={v} className="flex items-start gap-3">
                    <span className="font-mono text-xs font-bold text-primary w-4 shrink-0 mt-0.5">{v}</span>
                    <span className="flex-1 text-xs text-muted-foreground">{desc}</span>
                    <span className="font-mono text-xs font-bold text-red-400 shrink-0">{pts}</span>
                  </div>
                ))}
              </div>
              {/* Thresholds */}
              <div className="space-y-1.5 pt-1 border-t border-border/30">
                {[
                  { range: '0–39',   verdict: 'ALLOW', label: 'Safe',     color: '#22c55e' },
                  { range: '40–69',  verdict: 'WARN',  label: 'Suspect',  color: '#f59e0b' },
                  { range: '70–100', verdict: 'BLOCK', label: 'Phishing', color: '#ef4444' },
                ].map(({ range, verdict, label, color }) => (
                  <div key={verdict} className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-muted-foreground w-14 shrink-0">{range}</span>
                    <span className="text-[11px] font-bold rounded px-1.5 py-0.5"
                      style={{ backgroundColor: `${color}20`, color }}>{verdict}</span>
                    <span className="text-xs text-muted-foreground">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Scans */}
          <div className="rounded-2xl border border-border/50 bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Recent Scans
              </p>
              <span className="text-[11px] text-muted-foreground">Session only</span>
            </div>

            {history.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
                <Globe className="h-8 w-8 text-muted-foreground/20" />
                <p className="text-sm">No scans yet</p>
                <p className="text-xs">Analyze a URL to see results here</p>
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((h, i) => {
                  const cfg = {
                    BLOCK: { color: '#ef4444', label: 'BLOCK' },
                    WARN:  { color: '#f59e0b', label: 'WARN'  },
                    ALLOW: { color: '#22c55e', label: 'ALLOW' },
                  }[h.decision]
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-xl border border-border/40 bg-secondary/20 px-3 py-2.5"
                    >
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: cfg.color }}
                      />
                      <span className="font-mono text-xs text-muted-foreground truncate flex-1">
                        {h.url}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-mono">{h.score}</span>
                        <span
                          className="text-[10px] font-bold rounded px-1.5 py-0.5"
                          style={{ backgroundColor: `${cfg.color}20`, color: cfg.color }}
                        >
                          {cfg.label}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* How it works */}
          <div className="rounded-2xl border border-border/50 bg-card p-5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              How It Works
            </p>
            <div className="space-y-2.5">
              {[
                { step: '01', text: 'Parse URL and extract hostname, protocol, path components' },
                { step: '02', text: 'Compare against Levenshtein lookalike patterns for top 50 domains' },
                { step: '03', text: 'Check for heuristic signals — homoglyphs, IP, HTTP, subdomains' },
                { step: '04', text: 'Calculate cumulative risk score from signal weights' },
                { step: '05', text: 'Render verdict and block autofill if score ≥ 70' },
              ].map(({ step, text }) => (
                <div key={step} className="flex items-start gap-3">
                  <span className="shrink-0 text-[11px] font-bold font-mono text-primary">{step}</span>
                  <span className="text-xs text-muted-foreground">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
