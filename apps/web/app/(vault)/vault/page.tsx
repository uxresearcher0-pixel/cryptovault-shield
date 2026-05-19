"use client"

import React, { useState, useMemo } from 'react'
import {
  Plus,
  Search,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  Edit3,
  Shield,
  RefreshCw,
  ExternalLink,
  Key,
  Check,
  ShieldAlert,
  Lock,
} from 'lucide-react'
import type { Category, Credential } from '@cryptovault/crypto-core'
import { analyzePassword, generatePassword } from '@cryptovault/crypto-core'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { useVault } from '@/contexts/vault-context'
import { cn } from '@/lib/utils'

// ─── Avatar color (deterministic by site name) ────────────────────────────
const AVATAR_PALETTES = [
  'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-600',
  'bg-teal-500', 'bg-blue-500', 'bg-indigo-500', 'bg-violet-500',
  'bg-purple-500', 'bg-pink-500', 'bg-slate-600', 'bg-cyan-600',
]
function avatarColor(name: string): string {
  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return AVATAR_PALETTES[hash % AVATAR_PALETTES.length]
}

// ─── Strength label ───────────────────────────────────────────────────────
function StrengthLabel({ strength }: { strength: string }) {
  const map: Record<string, string> = {
    'very-strong': 'text-cyan-400', strong: 'text-green-400',
    moderate: 'text-amber-400', weak: 'text-orange-400', 'very-weak': 'text-red-400',
  }
  const labels: Record<string, string> = {
    'very-strong': 'V.Strong', strong: 'Strong', moderate: 'Moderate',
    weak: 'Weak', 'very-weak': 'V.Weak',
  }
  return (
    <span className={cn('text-xs font-semibold shrink-0', map[strength] ?? 'text-muted-foreground')}>
      {labels[strength] ?? strength}
    </span>
  )
}

// ─── All categories ───────────────────────────────────────────────────────
const ALL_CATEGORIES: Category[] = ['work', 'personal', 'finance', 'social', 'email', 'shopping', 'gaming', 'entertainment', 'other']

// ─── Password row ─────────────────────────────────────────────────────────
function PasswordRow({ password }: { password: string }) {
  const [show, setShow] = useState(false)
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(password)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <div className="flex items-center gap-2">
      <span className="flex-1 text-sm font-mono text-foreground">
        {show ? password : '•'.repeat(Math.min(password.length, 14))}
      </span>
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={() => setShow(v => !v)}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors">
          {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </button>
        <button onClick={copy}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors">
          {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  )
}

// ─── Copy field ───────────────────────────────────────────────────────────
function CopyField({ label, value, canOpen }: { label: string; value: string; canOpen?: boolean }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <div className="rounded-xl border border-border/50 bg-secondary/20 px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">{label}</p>
      <div className="flex items-center gap-2">
        <span className="flex-1 text-sm font-medium text-foreground truncate">{value}</span>
        <div className="flex items-center gap-1 shrink-0">
          {canOpen && value && (
            <a href={value} target="_blank" rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors">
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
          <button onClick={copy}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors">
            {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Credential dialog ────────────────────────────────────────────────────
function CredentialDialog({ open, onClose, editing }: { open: boolean; onClose: () => void; editing: Credential | null }) {
  const { addCredential, updateCredential } = useVault()
  const [site, setSite] = useState(editing?.site ?? '')
  const [url, setUrl] = useState(editing?.url ?? '')
  const [username, setUsername] = useState(editing?.username ?? '')
  const [password, setPassword] = useState(editing?.password ?? '')
  const [category, setCategory] = useState<Category>(editing?.category ?? 'other')
  const [mfaEnabled, setMfaEnabled] = useState(editing?.mfaEnabled ?? false)
  const [showPass, setShowPass] = useState(false)

  React.useEffect(() => {
    if (editing) {
      setSite(editing.site); setUrl(editing.url ?? ''); setUsername(editing.username)
      setPassword(editing.password); setCategory(editing.category); setMfaEnabled(editing.mfaEnabled)
    } else {
      setSite(''); setUrl(''); setUsername(''); setPassword(''); setCategory('other'); setMfaEnabled(false)
    }
  }, [editing, open])

  const analysis = password ? analyzePassword(password) : null

  const handleGenerate = () => {
    const p = generatePassword({ length: 20, uppercase: true, lowercase: true, numbers: true, symbols: true })
    setPassword(p); setShowPass(true)
  }

  const handleSave = () => {
    if (!site || !username || !password) return
    const data = {
      site, url, username, password, category, mfaEnabled,
      notes: editing?.notes ?? '',
      entropy: analysis?.entropy ?? 0,
      strength: analysis?.strength ?? 'weak',
    }
    if (editing) updateCredential(editing.id, data)
    else addCredential(data)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{editing ? 'Edit Credential' : 'Add Credential'}</DialogTitle></DialogHeader>
        <div className="flex flex-col gap-3 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Site Name *</Label>
              <Input value={site} onChange={e => setSite(e.target.value)} placeholder="Netflix" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>URL</Label>
              <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Username / Email *</Label>
            <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="you@email.com" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Password *</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input type={showPass ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="Enter or generate" className="pr-10" />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button type="button" variant="outline" size="icon" onClick={handleGenerate}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            {analysis && (
              <div className="flex items-center gap-2">
                <Progress value={Math.min(100, (analysis.entropy / 120) * 100)} className="h-1 flex-1" />
                <span className="text-xs text-muted-foreground capitalize">{analysis.strength.replace('-', ' ')}</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Category</Label>
              <select value={category} onChange={e => setCategory(e.target.value as Category)}
                className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm">
                {ALL_CATEGORIES.map(c => (
                  <option key={c} value={c} className="bg-card capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>2FA Enabled</Label>
              <div className="flex items-center gap-2 pt-1.5">
                <button type="button" role="switch" aria-checked={mfaEnabled} onClick={() => setMfaEnabled(v => !v)}
                  className={cn('inline-flex h-5 w-9 items-center rounded-full border-2 border-transparent transition-colors', mfaEnabled ? 'bg-primary' : 'bg-secondary')}>
                  <span className={cn('block h-4 w-4 rounded-full bg-white shadow transition-transform', mfaEnabled ? 'translate-x-4' : 'translate-x-0')} />
                </button>
                <span className="text-sm text-muted-foreground">{mfaEnabled ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!site || !username || !password}>
            {editing ? 'Save Changes' : 'Add Credential'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Detail panel ─────────────────────────────────────────────────────────
function DetailPanel({ cred, onEdit, onDelete }: { cred: Credential; onEdit: () => void; onDelete: () => void }) {
  const { alerts } = useVault()
  const analysis = analyzePassword(cred.password)
  const credAlerts = alerts.filter(a => a.credentialId === cred.id && !a.resolved)
  const hasBreach = credAlerts.some(a => a.type === 'breach')
  const hasReuse = credAlerts.some(a => a.type === 'reuse')
  const strengthPct = Math.min(100, (analysis.entropy / 120) * 100)

  const barColors: Record<string, string> = {
    'very-strong': '#22d3ee', strong: '#22c55e', moderate: '#f59e0b',
    weak: '#f97316', 'very-weak': '#ef4444',
  }
  const barColor = barColors[analysis.strength] ?? '#6b7280'

  const catStyles: Record<string, string> = {
    social:        'bg-blue-500/15 text-blue-400 border-blue-500/25',
    work:          'bg-green-500/15 text-green-400 border-green-500/25',
    finance:       'bg-yellow-500/15 text-yellow-400 border-yellow-500/25',
    personal:      'bg-violet-500/15 text-violet-400 border-violet-500/25',
    shopping:      'bg-orange-500/15 text-orange-400 border-orange-500/25',
    entertainment: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
    email:         'bg-teal-500/15 text-teal-400 border-teal-500/25',
    gaming:        'bg-pink-500/15 text-pink-400 border-pink-500/25',
    other:         'bg-slate-500/15 text-slate-400 border-slate-500/25',
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-5 border-b border-border/50 shrink-0">
        <div className={cn(
          'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold text-white',
          avatarColor(cred.site),
        )}>
          {cred.site.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold leading-none">{cred.site}</h2>
          {cred.url && (
            <p className="text-sm text-muted-foreground truncate mt-1">
              {cred.url.replace(/^https?:\/\//, '')}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onEdit}
            className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors">
            <Edit3 className="h-4 w-4" />
          </button>
          <button onClick={onDelete}
            className="p-2.5 rounded-xl text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {/* Warning banners */}
        {hasBreach && (
          <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/8 px-4 py-3">
            <ShieldAlert className="h-4 w-4 shrink-0 text-red-400" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-red-400">Breach Detected</p>
              <p className="text-xs text-red-400/70 mt-0.5">Password found in a known data breach. Update immediately.</p>
            </div>
            <Button size="sm" className="shrink-0 bg-red-500 hover:bg-red-600 text-white h-7 text-xs px-3">
              Update
            </Button>
          </div>
        )}
        {hasReuse && (
          <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/8 px-4 py-3">
            <RefreshCw className="h-4 w-4 shrink-0 text-amber-400" />
            <p className="text-sm text-amber-400/90">Password reuse detected — this password is shared with another account.</p>
          </div>
        )}
        {!cred.mfaEnabled && (
          <div className="flex items-center gap-3 rounded-xl border border-orange-500/20 bg-orange-500/6 px-4 py-3">
            <Lock className="h-4 w-4 shrink-0 text-orange-400" />
            <p className="text-sm text-orange-400/90">Two-factor authentication is not enabled.</p>
          </div>
        )}

        {/* Credential fields */}
        <CopyField label="Email / Username" value={cred.username} />

        {/* Password with strength bar */}
        <div className="rounded-xl border border-border/50 bg-secondary/20 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Password</p>
          <PasswordRow password={cred.password} />
          <div className="mt-3 space-y-1.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-muted-foreground">Entropy: {analysis.entropy.toFixed(1)} bits</span>
              <span className="font-semibold capitalize" style={{ color: barColor }}>
                {analysis.strength.replace('-', ' ')}
              </span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${strengthPct}%`, backgroundColor: barColor }} />
            </div>
          </div>
        </div>

        {cred.url && <CopyField label="Website URL" value={cred.url} canOpen />}

        {/* Metadata grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border/50 bg-secondary/20 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Category</p>
            <span className={cn('inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-semibold capitalize',
              catStyles[cred.category] ?? catStyles.other)}>
              {cred.category}
            </span>
          </div>
          <div className="rounded-xl border border-border/50 bg-secondary/20 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Last Modified</p>
            <p className="text-sm font-medium">{new Date(cred.updatedAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-secondary/20 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Two-Factor Auth</p>
            <p className={cn('text-sm font-semibold', cred.mfaEnabled ? 'text-primary' : 'text-red-400')}>
              {cred.mfaEnabled ? 'Enabled' : 'Not Enabled'}
            </p>
          </div>
          <div className="rounded-xl border border-border/50 bg-secondary/20 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Vault Status</p>
            <p className="text-sm font-semibold text-primary">AES-256-GCM Encrypted</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────
export default function VaultPage() {
  const { credentials, deleteCredential, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory } = useVault()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Credential | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const passCount = useMemo(() => {
    const c: Record<string, number> = {}
    credentials.forEach(cr => { c[cr.password] = (c[cr.password] ?? 0) + 1 })
    return c
  }, [credentials])

  const catCounts = useMemo(() => {
    const c: Record<string, number> = {}
    credentials.forEach(cr => { c[cr.category] = (c[cr.category] ?? 0) + 1 })
    return c
  }, [credentials])

  const filtered = useMemo(() => credentials.filter(c => {
    const matchCat = selectedCategory === 'all' || c.category === selectedCategory
    const q = searchQuery.toLowerCase()
    return matchCat && (!q || c.site.toLowerCase().includes(q) || c.username.toLowerCase().includes(q))
  }), [credentials, searchQuery, selectedCategory])

  const selectedCred = useMemo(() => {
    if (selectedId) {
      const found = filtered.find(c => c.id === selectedId)
      if (found) return found
    }
    return filtered[0] ?? null
  }, [filtered, selectedId])

  const usedCategories = ALL_CATEGORIES.filter(c => catCounts[c] > 0)

  const openAdd = () => { setEditing(null); setDialogOpen(true) }
  const openEdit = (cred: Credential) => { setEditing(cred); setDialogOpen(true) }
  const handleDelete = (id: string) => {
    deleteCredential(id)
    if (selectedId === id) setSelectedId(null)
  }

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── Left: list ────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col border-r border-border/50 bg-background overflow-hidden">

        {/* Header */}
        <div className="px-4 pt-5 pb-3 shrink-0">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-lg font-bold">Vault</h1>
            <Button onClick={openAdd} size="sm"
              className="h-8 gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs px-3 rounded-lg">
              <Plus className="h-3.5 w-3.5" />
              Add
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">{credentials.length} credentials · AES-256 encrypted</p>
        </div>

        {/* Search */}
        <div className="px-4 pb-3 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search vault..."
              className="w-full rounded-lg border border-border/50 bg-secondary/40 pl-8 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
        </div>

        {/* Category chips */}
        <div className="px-4 pb-3 shrink-0">
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => setSelectedCategory('all')}
              className={cn('rounded-full px-2.5 py-1 text-[11px] font-semibold border transition-colors',
                selectedCategory === 'all'
                  ? 'bg-primary/15 text-primary border-primary/30'
                  : 'bg-secondary/40 text-muted-foreground border-border/40 hover:text-foreground')}>
              All {credentials.length}
            </button>
            {usedCategories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)}
                className={cn('rounded-full px-2.5 py-1 text-[11px] font-semibold border capitalize transition-colors',
                  selectedCategory === cat
                    ? 'bg-primary/15 text-primary border-primary/30'
                    : 'bg-secondary/40 text-muted-foreground border-border/40 hover:text-foreground')}>
                {cat} {catCounts[cat]}
              </button>
            ))}
          </div>
        </div>

        {/* Credential list */}
        <div className="flex-1 overflow-y-auto pb-4 px-2">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
              <Key className="h-8 w-8 opacity-20" />
              <p className="text-xs">No credentials found</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {filtered.map(cred => {
                const isSelected = cred.id === selectedCred?.id
                const isReused = (passCount[cred.password] ?? 0) > 1
                return (
                  <button key={cred.id} onClick={() => setSelectedId(cred.id)}
                    className={cn(
                      'w-full flex items-center gap-3 rounded-lg px-3 py-3 text-left transition-all border-l-2',
                      isSelected
                        ? 'bg-secondary/50 border-l-primary'
                        : 'border-l-transparent hover:bg-secondary/25',
                    )}>
                    <div className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white',
                      avatarColor(cred.site),
                    )}>
                      {cred.site.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold truncate">{cred.site}</span>
                        {cred.mfaEnabled && <Shield className="h-3 w-3 text-primary shrink-0" />}
                        {isReused && <RefreshCw className="h-3 w-3 text-amber-400 shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{cred.username}</p>
                    </div>
                    <StrengthLabel strength={cred.strength} />
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Right: detail ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden bg-background">
        {selectedCred ? (
          <DetailPanel
            cred={selectedCred}
            onEdit={() => openEdit(selectedCred)}
            onDelete={() => handleDelete(selectedCred.id)}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border/50">
              <Shield className="h-8 w-8 opacity-20" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">Select a credential to view details</p>
              <p className="text-xs mt-1 text-muted-foreground">or add your first credential</p>
            </div>
            <Button onClick={openAdd} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Credential
            </Button>
          </div>
        )}
      </div>

      <CredentialDialog open={dialogOpen} onClose={() => setDialogOpen(false)} editing={editing} />
    </div>
  )
}
