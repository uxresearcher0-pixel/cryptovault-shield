import type { Credential, SecurityScore, VaultStats } from './types'

export function calculateSecurityScore(credentials: Credential[]): SecurityScore {
  if (credentials.length === 0) {
    return {
      total: 0,
      breakdown: { entropy: 0, uniqueness: 0, age: 0, mfa: 0, phishing: 80, breach: 80 },
    }
  }

  // E — average entropy score (normalized 0-100, cap at 120 bits = 100%)
  const entropy =
    credentials.reduce((sum, c) => sum + Math.min(100, (c.entropy / 120) * 100), 0) /
    credentials.length

  // U — uniqueness score
  const passwords = credentials.map(c => c.password)
  const uniqueCount = new Set(passwords).size
  const uniqueness = (uniqueCount / passwords.length) * 100

  // A — age score (updated within 6 months)
  const sixMonthsAgo = new Date(Date.now() - 6 * 30 * 86400000)
  const recentCount = credentials.filter(c => new Date(c.updatedAt) > sixMonthsAgo).length
  const age = (recentCount / credentials.length) * 100

  // M — MFA adoption score
  const mfaCount = credentials.filter(c => c.mfaEnabled).length
  const mfa = (mfaCount / credentials.length) * 100

  // P & B — simulated (no external API in local MVP)
  const phishing = 80
  const breach = 80

  // Weighted formula: 0.25E + 0.20U + 0.10A + 0.15M + 0.20P + 0.10B
  const total = Math.round(
    0.25 * entropy +
    0.20 * uniqueness +
    0.10 * age +
    0.15 * mfa +
    0.20 * phishing +
    0.10 * breach,
  )

  return {
    total,
    breakdown: {
      entropy: Math.round(entropy),
      uniqueness: Math.round(uniqueness),
      age: Math.round(age),
      mfa: Math.round(mfa),
      phishing,
      breach,
    },
  }
}

export function getVaultStats(credentials: Credential[]): VaultStats {
  const sixMonthsAgo = new Date(Date.now() - 6 * 30 * 86400000)
  const passCounts = credentials.reduce<Record<string, number>>((acc, c) => {
    acc[c.password] = (acc[c.password] || 0) + 1
    return acc
  }, {})
  return {
    total: credentials.length,
    weak: credentials.filter(c => ['very-weak', 'weak'].includes(c.strength)).length,
    reused: credentials.filter(c => passCounts[c.password] > 1).length,
    noMfa: credentials.filter(c => !c.mfaEnabled).length,
    old: credentials.filter(c => new Date(c.updatedAt) < sixMonthsAgo).length,
    breached: 1,
  }
}

export function scoreColor(score: number): string {
  if (score >= 80) return '#10b981'
  if (score >= 60) return '#f59e0b'
  if (score >= 40) return '#f97316'
  return '#ef4444'
}

export function scoreLabel(score: number): string {
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Good'
  if (score >= 40) return 'Fair'
  return 'Poor'
}
