"use client"

import React, { useState } from 'react'
import {
  Shield,
  Bell,
  Palette,
  HardDrive,
  User,
  Lock,
  Clock,
  Eye,
  EyeOff,
  Download,
  Save,
  Check,
  Key,
  Smartphone,
  Wifi,
} from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { useVault } from '@/contexts/vault-context'
import { cn } from '@/lib/utils'

type Tab = 'security' | 'notifications' | 'appearance' | 'vault' | 'account'

const TABS: Array<{ id: Tab; label: string; icon: React.ElementType }> = [
  { id: 'security',      label: 'Security',       icon: Shield      },
  { id: 'notifications', label: 'Notifications',  icon: Bell        },
  { id: 'appearance',    label: 'Appearance',     icon: Palette     },
  { id: 'vault',         label: 'Vault & Backup', icon: HardDrive   },
  { id: 'account',       label: 'Account',        icon: User        },
]

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
      {children}
    </p>
  )
}

function ToggleRow({
  label, sub, checked, onChange,
}: { label: string; sub?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/40 bg-secondary/20 px-4 py-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}

export default function SettingsPage() {
  const { credentials, lock } = useVault()
  const [tab, setTab]   = useState<Tab>('security')
  const [saved, setSaved] = useState(false)

  // Security
  const [autoLock,          setAutoLock]          = useState(15)
  const [clipTimeout,       setClipTimeout]       = useState(30)
  const [clipClear,         setClipClear]         = useState(true)
  const [biometric,         setBiometric]         = useState(false)
  const [twoFaVault,        setTwoFaVault]        = useState(false)
  const [phishingProtect,   setPhishingProtect]   = useState(true)
  const [breachMonitor,     setBreachMonitor]     = useState(true)
  const [autofillBlock,     setAutofillBlock]     = useState(true)

  // Notifications
  const [notifyBreach,      setNotifyBreach]      = useState(true)
  const [notifyWeak,        setNotifyWeak]        = useState(true)
  const [notifyReuse,       setNotifyReuse]       = useState(true)
  const [notifyExpired,     setNotifyExpired]     = useState(false)
  const [notifyPhishing,    setNotifyPhishing]    = useState(true)

  // Appearance
  const [compactMode,       setCompactMode]       = useState(false)
  const [showEntropy,       setShowEntropy]       = useState(true)

  // Vault
  const [autoSave,          setAutoSave]          = useState(true)
  const [showPassDefault,   setShowPassDefault]   = useState(false)

  // Account
  const [currentPass, setCurrentPass] = useState('')
  const [newPass,     setNewPass]     = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew,     setShowNew]     = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleExport = () => {
    const data = JSON.stringify({
      exported: new Date().toISOString(),
      count: credentials.length,
      note: 'AES-256-GCM encrypted export — MVP placeholder',
    }, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'cryptovault-backup.json'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure vault preferences and security policies
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[220px_1fr]">

        {/* ── Tab sidebar ────────────────────────────────────────────── */}
        <div className="space-y-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                'w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors text-left',
                tab === id
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </button>
          ))}
        </div>

        {/* ── Content panel ──────────────────────────────────────────── */}
        <div className="space-y-5">

          {/* SECURITY TAB */}
          {tab === 'security' && (
            <>
              <div className="rounded-2xl border border-border/50 bg-card p-5 space-y-4">
                <SectionLabel>Auto-Lock</SectionLabel>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Lock after inactivity</span>
                    <span className="text-sm font-bold font-mono text-primary">{autoLock} min</span>
                  </div>
                  <Slider
                    value={[autoLock]}
                    min={1}
                    max={60}
                    step={1}
                    onValueChange={([v]) => setAutoLock(v)}
                  />
                  <div className="flex justify-between mt-1.5 text-[11px] text-muted-foreground">
                    <span>1 min</span>
                    <span className="text-amber-400">15 min (recommended)</span>
                    <span>60 min</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Clipboard clear timeout</span>
                    <span className="text-sm font-bold font-mono text-primary">{clipTimeout}s</span>
                  </div>
                  <Slider
                    value={[clipTimeout]}
                    min={10}
                    max={120}
                    step={5}
                    onValueChange={([v]) => setClipTimeout(v)}
                  />
                  <div className="flex justify-between mt-1.5 text-[11px] text-muted-foreground">
                    <span>10s</span>
                    <span className="text-amber-400">30s (default)</span>
                    <span>120s</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border/50 bg-card p-5 space-y-2">
                <SectionLabel>Authentication</SectionLabel>
                <ToggleRow
                  label="Biometric unlock"
                  sub="Use Touch ID / Face ID to unlock vault"
                  checked={biometric}
                  onChange={setBiometric}
                />
                <ToggleRow
                  label="Two-factor authentication"
                  sub="Require TOTP on vault access"
                  checked={twoFaVault}
                  onChange={setTwoFaVault}
                />
                <ToggleRow
                  label="Auto-clear clipboard"
                  sub="Erase copied passwords after timeout"
                  checked={clipClear}
                  onChange={setClipClear}
                />
              </div>

              <div className="rounded-2xl border border-border/50 bg-card p-5 space-y-2">
                <SectionLabel>Protection</SectionLabel>
                <ToggleRow
                  label="Phishing protection"
                  sub="Block autofill on suspicious domains"
                  checked={phishingProtect}
                  onChange={setPhishingProtect}
                />
                <ToggleRow
                  label="Breach monitoring"
                  sub="Alert when credentials appear in breaches"
                  checked={breachMonitor}
                  onChange={setBreachMonitor}
                />
                <ToggleRow
                  label="Block autofill on lookalike domains"
                  sub="Prevent autofill on typosquatted sites"
                  checked={autofillBlock}
                  onChange={setAutofillBlock}
                />
              </div>

              {/* Encryption info */}
              <div className="rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-primary shrink-0" />
                  <p className="text-sm font-semibold text-primary">Encryption Information</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Cipher',         value: 'AES-256-GCM'       },
                    { label: 'Key Derivation', value: 'PBKDF2 310K iter'  },
                    { label: 'Hash',           value: 'SHA-256'            },
                    { label: 'Architecture',   value: 'Zero-Knowledge'     },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between rounded-lg bg-primary/10 px-3 py-2">
                      <span className="text-xs text-primary/70">{label}</span>
                      <span className="text-xs font-mono font-bold text-primary">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* NOTIFICATIONS TAB */}
          {tab === 'notifications' && (
            <div className="rounded-2xl border border-border/50 bg-card p-5 space-y-2">
              <SectionLabel>Alert Preferences</SectionLabel>
              <ToggleRow
                label="Breach alerts"
                sub="Notify when credentials are found in data leaks"
                checked={notifyBreach}
                onChange={setNotifyBreach}
              />
              <ToggleRow
                label="Weak password warnings"
                sub="Alert on passwords below entropy threshold"
                checked={notifyWeak}
                onChange={setNotifyWeak}
              />
              <ToggleRow
                label="Password reuse detection"
                sub="Flag credentials shared across multiple sites"
                checked={notifyReuse}
                onChange={setNotifyReuse}
              />
              <ToggleRow
                label="Phishing attempt alerts"
                sub="Notify when a phishing site is blocked"
                checked={notifyPhishing}
                onChange={setNotifyPhishing}
              />
              <ToggleRow
                label="Expired password reminders"
                sub="Remind when passwords haven't been changed in 90 days"
                checked={notifyExpired}
                onChange={setNotifyExpired}
              />
            </div>
          )}

          {/* APPEARANCE TAB */}
          {tab === 'appearance' && (
            <div className="rounded-2xl border border-border/50 bg-card p-5 space-y-2">
              <SectionLabel>Display</SectionLabel>
              <ToggleRow
                label="Compact mode"
                sub="Reduce spacing for denser credential lists"
                checked={compactMode}
                onChange={setCompactMode}
              />
              <ToggleRow
                label="Show entropy scores"
                sub="Display entropy bits next to each credential"
                checked={showEntropy}
                onChange={setShowEntropy}
              />
              <ToggleRow
                label="Show passwords by default"
                sub="Reveal password fields without clicking the eye icon"
                checked={showPassDefault}
                onChange={setShowPassDefault}
              />
            </div>
          )}

          {/* VAULT & BACKUP TAB */}
          {tab === 'vault' && (
            <>
              <div className="rounded-2xl border border-border/50 bg-card p-5 space-y-2">
                <SectionLabel>Vault Options</SectionLabel>
                <ToggleRow
                  label="Auto-save credentials"
                  sub="Automatically prompt to save new login credentials"
                  checked={autoSave}
                  onChange={setAutoSave}
                />
              </div>

              <div className="rounded-2xl border border-border/50 bg-card p-5 space-y-4">
                <SectionLabel>Backup & Export</SectionLabel>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">Export Vault</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Download an encrypted JSON backup of all {credentials.length} credentials
                    </p>
                  </div>
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-2 shrink-0 rounded-xl border border-border/60 bg-secondary/40 px-3 py-2 text-sm font-medium hover:bg-secondary/60 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-border/50 bg-card p-5">
                <SectionLabel>Vault Information</SectionLabel>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Total credentials', value: String(credentials.length) },
                    { label: 'Encryption',         value: 'AES-256-GCM'             },
                    { label: 'Key derivation',      value: 'PBKDF2 310K'             },
                    { label: 'Architecture',        value: 'Zero-Knowledge'          },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-xl border border-border/40 bg-secondary/20 px-3 py-2.5">
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-sm font-mono font-medium mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ACCOUNT TAB */}
          {tab === 'account' && (
            <>
              <div className="rounded-2xl border border-border/50 bg-card p-5 space-y-3">
                <SectionLabel>Profile</SectionLabel>
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary text-xl font-bold">
                    SS
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Shahriar Shanto</p>
                    <p className="text-xs text-muted-foreground">uxresearcher0@gmail.com</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border/50 bg-card p-5 space-y-3">
                <SectionLabel>Change Master Password</SectionLabel>
                <p className="text-xs text-muted-foreground">
                  Your new master password will re-encrypt the entire vault. This cannot be undone.
                </p>
                {[
                  { label: 'Current master password', value: currentPass, onChange: setCurrentPass, show: showCurrent, toggle: () => setShowCurrent(v => !v) },
                  { label: 'New master password',     value: newPass,     onChange: setNewPass,     show: showNew,     toggle: () => setShowNew(v => !v) },
                ].map(({ label, value, onChange, show, toggle }) => (
                  <div key={label}>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</label>
                    <div className="relative">
                      <input
                        type={show ? 'text' : 'password'}
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        placeholder={label.includes('New') ? 'Minimum 12 characters' : 'Enter current password'}
                        className="w-full rounded-xl border border-border/60 bg-secondary/30 px-4 py-2.5 pr-10 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                      <button
                        type="button"
                        onClick={toggle}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                ))}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Confirm new password</label>
                  <input
                    type="password"
                    value={confirmPass}
                    onChange={e => setConfirmPass(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full rounded-xl border border-border/60 bg-secondary/30 px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <button
                  disabled={!currentPass || !newPass || newPass !== confirmPass || newPass.length < 12}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-border/60 bg-secondary/40 px-4 py-2.5 text-sm font-semibold hover:bg-secondary/60 transition-colors disabled:opacity-40"
                >
                  <Key className="h-4 w-4" />
                  Update Master Password
                </button>
              </div>

              <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
                <p className="text-sm font-semibold text-red-400 mb-1">Danger Zone</p>
                <p className="text-xs text-muted-foreground mb-3">
                  Permanently delete all credentials and reset the vault. This cannot be recovered.
                </p>
                <button className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/20 transition-colors">
                  Delete All Data
                </button>
              </div>
            </>
          )}

          {/* Save button */}
          <div className="flex items-center justify-between pt-1">
            <p className="text-xs text-muted-foreground">Changes apply immediately</p>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {saved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
