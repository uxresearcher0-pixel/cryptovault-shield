"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { analyzePassword } from '@cryptovault/crypto-core'
import { cn } from '@/lib/utils'

const REQUIREMENTS = [
  { label: 'At least 12 characters', test: (p: string) => p.length >= 12 },
  { label: 'Uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Number', test: (p: string) => /\d/.test(p) },
  { label: 'Special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
]

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')

  const analysis = password ? analyzePassword(password) : null
  const strengthPct = analysis ? Math.min(100, (analysis.entropy / 120) * 100) : 0
  const strengthColors: Record<string, string> = {
    'very-weak': '#ef4444',
    'weak': '#f97316',
    'moderate': '#f59e0b',
    'strong': '#10b981',
    'very-strong': '#06b6d4',
  }
  const strengthColor = analysis ? (strengthColors[analysis.strength] ?? '#ef4444') : '#ef4444'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { setError('All fields are required'); return }
    if (password !== confirm) { setError('Passwords do not match'); return }
    const failing = REQUIREMENTS.filter(r => !r.test(password))
    if (failing.length > 0) { setError(`Password too weak: ${failing[0].label}`); return }
    // MVP: just navigate to vault
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
            <Shield className="h-7 w-7 text-primary" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">CryptoVault</h1>
            <p className="text-sm text-muted-foreground mt-1">Create your secure vault</p>
          </div>
        </div>

        <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Create an account</CardTitle>
            <CardDescription>
              Choose a strong master password — it cannot be recovered if lost.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Master Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Create a strong master password"
                    className="pr-10"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {password && (
                  <div className="flex flex-col gap-1">
                    <Progress
                      value={strengthPct}
                      className="h-1.5"
                      indicatorClassName="transition-all"
                      style={{ '--tw-bg-opacity': '1' } as React.CSSProperties}
                    />
                    <p className="text-xs" style={{ color: strengthColor }}>
                      {analysis?.strength.replace('-', ' ')} · {Math.round(analysis?.entropy ?? 0)} bits entropy
                    </p>
                  </div>
                )}
              </div>

              {/* Requirements */}
              {password && (
                <ul className="flex flex-col gap-1">
                  {REQUIREMENTS.map(req => {
                    const met = req.test(password)
                    return (
                      <li key={req.label} className={cn('flex items-center gap-1.5 text-xs', met ? 'text-emerald-400' : 'text-muted-foreground')}>
                        {met ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                        {req.label}
                      </li>
                    )
                  })}
                </ul>
              )}

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="confirm">Confirm Master Password</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Repeat master password"
                  autoComplete="new-password"
                  aria-invalid={!!confirm && confirm !== password}
                />
                {confirm && confirm !== password && (
                  <p className="text-xs text-destructive">Passwords don't match</p>
                )}
              </div>

              {error && (
                <p className="text-xs text-destructive" role="alert">{error}</p>
              )}

              <Button type="submit" className="w-full">
                Create Vault
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-xs text-muted-foreground">
                Already have an account?{' '}
                <a href="/login" className="text-primary hover:underline">
                  Unlock vault
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-4">
          ⚠️ Your master password cannot be recovered. Store it safely.
        </p>
      </div>
    </div>
  )
}
