"use client"

import React, { useState } from 'react'
import {
  Settings, X, Lock, Shield, Bell, Palette, User, Eye,
  ChevronRight, Monitor, Sun, Moon, Check,
} from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { useAppearance, ACCENT_PRESETS, type Theme, type AccentHex } from '@/contexts/appearance-context'

type Tab = 'security' | 'notifications' | 'appearance' | 'privacy' | 'account'

// ─── Toggle switch ─────────────────────────────────────────────────────────
function Toggle({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onToggle}
      className={cn(
        'inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        checked ? 'bg-primary' : 'bg-secondary/80',
      )}
    >
      <span className={cn(
        'block h-4 w-4 rounded-full bg-white shadow transition-transform',
        checked ? 'translate-x-4' : 'translate-x-0',
      )} />
    </button>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-2 mt-5 first:mt-0">
      {title}
    </p>
  )
}

function SettingRow({ label, description, children }: {
  label: string; description?: string; children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border/40 bg-secondary/15 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-none">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function SliderRow({ label, value, min, max, unit, onValueChange }: {
  label: string; value: number; min: number; max: number; unit: string
  onValueChange: (v: number) => void
}) {
  return (
    <div className="rounded-xl border border-border/40 bg-secondary/15 px-4 py-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm font-bold text-primary tabular-nums">{value} {unit}</span>
      </div>
      <Slider value={[value]} min={min} max={max} step={1}
        onValueChange={([v]) => onValueChange(v)} className="w-full" />
      <div className="flex justify-between text-[11px] text-muted-foreground">
        <span>{min} {unit}</span><span>{max} {unit}</span>
      </div>
    </div>
  )
}

const NAV_TABS: Array<{ id: Tab; label: string; icon: React.ElementType }> = [
  { id: 'security',      label: 'Security',      icon: Shield  },
  { id: 'notifications', label: 'Notifications', icon: Bell    },
  { id: 'appearance',    label: 'Appearance',    icon: Palette },
  { id: 'privacy',       label: 'Privacy',       icon: Eye     },
  { id: 'account',       label: 'Account',       icon: User    },
]

export function SettingsPanel({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<Tab>('security')

  // ── Security tab state ────────────────────────────────────────────────
  const [lockTime,      setLockTime]      = useState(15)
  const [clipboardTime, setClipboardTime] = useState(30)
  const [biometric,     setBiometric]     = useState(false)
  const [twoFactor,     setTwoFactor]     = useState(false)
  const [antiPhishing,  setAntiPhishing]  = useState(true)
  const [breachMonitor, setBreachMonitor] = useState(true)
  const [credMonitor,   setCredMonitor]   = useState(true)

  // ── Notifications tab state ───────────────────────────────────────────
  const [emailAlerts,   setEmailAlerts]   = useState(true)
  const [pushAlerts,    setPushAlerts]    = useState(true)
  const [weeklyReport,  setWeeklyReport]  = useState(false)
  const [criticalOnly,  setCriticalOnly]  = useState(false)

  // ── Privacy tab state ─────────────────────────────────────────────────
  const [analytics,     setAnalytics]     = useState(false)
  const [crashReports,  setCrashReports]  = useState(false)
  const [autoFill,      setAutoFill]      = useState(true)

  // ── Appearance from context (drives real CSS changes) ─────────────────
  const { theme, accent, setTheme, setAccent } = useAppearance()

  const THEME_OPTIONS: Array<{ id: Theme; label: string; icon: React.ElementType; previewBg: string; previewBorder: string }> = [
    { id: 'dark',   label: 'Dark',   icon: Moon,    previewBg: 'bg-zinc-900',   previewBorder: 'border-zinc-700' },
    { id: 'light',  label: 'Light',  icon: Sun,     previewBg: 'bg-zinc-100',   previewBorder: 'border-zinc-300' },
    { id: 'system', label: 'System', icon: Monitor, previewBg: 'bg-gradient-to-br from-zinc-900 to-zinc-100', previewBorder: 'border-zinc-500' },
  ]

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 z-50 flex h-full w-[480px] flex-col bg-card border-l border-border/60 shadow-2xl animate-in slide-in-from-right duration-200">

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/60 border border-border/50 shrink-0">
            <Settings className="h-5 w-5 text-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold leading-none">Settings</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Configure your vault preferences</p>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0">

          {/* Left tab nav */}
          <div className="flex w-40 shrink-0 flex-col gap-0.5 border-r border-border/40 bg-background/30 px-2 py-3">
            {NAV_TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-left',
                  activeTab === id
                    ? 'bg-primary/12 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40 border border-transparent',
                )}
              >
                <Icon className={cn('h-4 w-4 shrink-0', activeTab === id ? 'text-primary' : '')} />
                {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto px-5 py-4">

            {/* ── SECURITY ──────────────────────────────────────────────── */}
            {activeTab === 'security' && (
              <div className="space-y-1.5">
                <SectionHeader title="Auto-Lock" />
                <SliderRow label="Auto-lock Time" value={lockTime} min={1} max={60} unit="min" onValueChange={setLockTime} />
                <SliderRow label="Clipboard Clear" value={clipboardTime} min={5} max={120} unit="sec" onValueChange={setClipboardTime} />

                <SectionHeader title="Authentication" />
                <SettingRow label="Biometric Auth" description="Use Face ID or fingerprint to unlock">
                  <Toggle checked={biometric} onToggle={() => setBiometric(v => !v)} />
                </SettingRow>
                <SettingRow label="Two-Factor Auth" description="Require 2FA for vault access">
                  <Toggle checked={twoFactor} onToggle={() => setTwoFactor(v => !v)} />
                </SettingRow>

                <SectionHeader title="Protection" />
                <SettingRow label="Anti-Phishing" description="Block credential autofill on suspicious sites">
                  <Toggle checked={antiPhishing} onToggle={() => setAntiPhishing(v => !v)} />
                </SettingRow>
                <SettingRow label="Breach Monitor" description="Scan passwords against breach databases">
                  <Toggle checked={breachMonitor} onToggle={() => setBreachMonitor(v => !v)} />
                </SettingRow>
                <SettingRow label="Credential Monitoring" description="Alert on suspicious account activity">
                  <Toggle checked={credMonitor} onToggle={() => setCredMonitor(v => !v)} />
                </SettingRow>

                <div className="mt-5 rounded-xl border border-primary/20 bg-primary/5 px-4 py-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="h-4 w-4 text-primary shrink-0" />
                    <p className="text-sm font-bold text-primary">Encryption Info</p>
                  </div>
                  <div className="space-y-1.5 pl-6">
                    {[
                      { label: 'Algorithm',       value: 'AES-256-GCM'          },
                      { label: 'Key Derivation',  value: 'PBKDF2 · 310K iterations' },
                      { label: 'Architecture',    value: 'Zero-Knowledge'       },
                      { label: 'Storage',         value: 'Client-side only'     },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{label}</span>
                        <span className="text-xs font-semibold text-primary">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── NOTIFICATIONS ─────────────────────────────────────────── */}
            {activeTab === 'notifications' && (
              <div className="space-y-1.5">
                <SectionHeader title="Alert Channels" />
                <SettingRow label="Email Alerts" description="Receive security alerts via email">
                  <Toggle checked={emailAlerts} onToggle={() => setEmailAlerts(v => !v)} />
                </SettingRow>
                <SettingRow label="Push Notifications" description="Browser push notifications for critical events">
                  <Toggle checked={pushAlerts} onToggle={() => setPushAlerts(v => !v)} />
                </SettingRow>

                <SectionHeader title="Reports" />
                <SettingRow label="Weekly Security Report" description="Summary email every Monday">
                  <Toggle checked={weeklyReport} onToggle={() => setWeeklyReport(v => !v)} />
                </SettingRow>
                <SettingRow label="Critical Alerts Only" description="Only notify on critical severity events">
                  <Toggle checked={criticalOnly} onToggle={() => setCriticalOnly(v => !v)} />
                </SettingRow>
              </div>
            )}

            {/* ── APPEARANCE ────────────────────────────────────────────── */}
            {activeTab === 'appearance' && (
              <div className="space-y-4">

                {/* Theme */}
                <div>
                  <SectionHeader title="Theme" />
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {THEME_OPTIONS.map(({ id, label, icon: Icon, previewBg, previewBorder }) => {
                      const isSelected = theme === id
                      return (
                        <button key={id} onClick={() => setTheme(id)}
                          className={cn(
                            'flex flex-col items-center gap-2 rounded-xl border p-3 transition-all cursor-pointer',
                            isSelected
                              ? 'border-primary/60 bg-primary/10'
                              : 'border-border/40 bg-secondary/15 hover:bg-secondary/30 hover:border-border/60',
                          )}
                        >
                          <div className={cn('h-10 w-full rounded-lg border', previewBg, previewBorder)}>
                            <div className="h-2 w-3/4 mx-2 mt-2 rounded bg-white/20" />
                            <div className="h-1.5 w-1/2 mx-2 mt-1 rounded bg-white/10" />
                          </div>
                          <div className="flex items-center gap-1">
                            <Icon className={cn('h-3 w-3', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                            <span className={cn('text-xs font-medium', isSelected ? 'text-primary' : 'text-muted-foreground')}>
                              {label}
                            </span>
                            {isSelected && <Check className="h-3 w-3 text-primary" />}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Accent Color */}
                <div>
                  <SectionHeader title="Accent Color" />
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    {ACCENT_PRESETS.map(({ hex, label, oklch }) => {
                      const isSelected = accent === hex
                      return (
                        <button key={hex} onClick={() => setAccent(hex as AccentHex)}
                          title={label}
                          className={cn(
                            'relative h-9 w-9 rounded-full border-[3px] transition-all cursor-pointer',
                            isSelected ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105 hover:border-white/40',
                          )}
                          style={{ backgroundColor: hex }}
                        >
                          {isSelected && <Check className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow" />}
                        </button>
                      )
                    })}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2">
                    Active: {ACCENT_PRESETS.find(p => p.hex === accent)?.label ?? 'Green'}
                  </p>
                </div>

                {/* Sidebar compact */}
                <div>
                  <SectionHeader title="Layout" />
                  <SettingRow label="Compact Sidebar" description="Reduce sidebar padding and spacing">
                    <Toggle checked={false} onToggle={() => {}} />
                  </SettingRow>
                </div>

              </div>
            )}

            {/* ── PRIVACY ───────────────────────────────────────────────── */}
            {activeTab === 'privacy' && (
              <div className="space-y-1.5">
                <SectionHeader title="Data Collection" />
                <SettingRow label="Analytics" description="Help improve CryptoVault with anonymous usage data">
                  <Toggle checked={analytics} onToggle={() => setAnalytics(v => !v)} />
                </SettingRow>
                <SettingRow label="Crash Reports" description="Send crash logs to help fix bugs">
                  <Toggle checked={crashReports} onToggle={() => setCrashReports(v => !v)} />
                </SettingRow>

                <SectionHeader title="Autofill" />
                <SettingRow label="Browser Autofill" description="Auto-fill credentials on trusted websites">
                  <Toggle checked={autoFill} onToggle={() => setAutoFill(v => !v)} />
                </SettingRow>
              </div>
            )}

            {/* ── ACCOUNT ───────────────────────────────────────────────── */}
            {activeTab === 'account' && (
              <div className="space-y-1.5">
                <SectionHeader title="Profile" />
                <div className="rounded-xl border border-border/40 bg-secondary/15 px-4 py-3 space-y-1">
                  <p className="text-sm font-semibold">Alex Smith</p>
                  <p className="text-xs text-muted-foreground">alex@example.com</p>
                </div>

                <SectionHeader title="Vault" />
                <button className="flex w-full items-center justify-between rounded-xl border border-border/40 bg-secondary/15 px-4 py-3 hover:bg-secondary/30 transition-colors">
                  <span className="text-sm font-medium">Export Vault</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
                <button className="flex w-full items-center justify-between rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 hover:bg-red-500/10 transition-colors">
                  <span className="text-sm font-medium text-red-400">Delete Account</span>
                  <ChevronRight className="h-4 w-4 text-red-400/60" />
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  )
}
