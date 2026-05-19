import type { PasswordStrength, PasswordAnalysis } from './types'

export function detectCharacterSetSize(password: string): number {
  let size = 0
  if (/[a-z]/.test(password)) size += 26
  if (/[A-Z]/.test(password)) size += 26
  if (/[0-9]/.test(password)) size += 10
  if (/[^a-zA-Z0-9]/.test(password)) size += 32
  return size || 1
}

export function calculateEntropy(password: string): number {
  if (!password) return 0
  const N = detectCharacterSetSize(password)
  const L = password.length
  return Math.round(L * Math.log2(N) * 10) / 10
}

export function classifyPassword(entropy: number): PasswordStrength {
  if (entropy < 40) return 'very-weak'
  if (entropy < 60) return 'weak'
  if (entropy < 80) return 'moderate'
  if (entropy < 100) return 'strong'
  return 'very-strong'
}

export function strengthLabel(strength: PasswordStrength): string {
  const labels: Record<PasswordStrength, string> = {
    'very-weak': 'Very Weak',
    weak: 'Weak',
    moderate: 'Moderate',
    strong: 'Strong',
    'very-strong': 'Very Strong',
  }
  return labels[strength]
}

export function strengthPercent(strength: PasswordStrength): number {
  const map: Record<PasswordStrength, number> = {
    'very-weak': 20,
    weak: 40,
    moderate: 60,
    strong: 80,
    'very-strong': 100,
  }
  return map[strength]
}

export function strengthColor(strength: PasswordStrength): string {
  const map: Record<PasswordStrength, string> = {
    'very-weak': '#ef4444',
    weak: '#f97316',
    moderate: '#f59e0b',
    strong: '#10b981',
    'very-strong': '#06b6d4',
  }
  return map[strength]
}

function estimateBruteForceTime(entropy: number): string {
  const guessesPerSecond = 1e12
  const avgGuesses = Math.pow(2, entropy - 1)
  const seconds = avgGuesses / guessesPerSecond
  if (seconds < 1) return 'Instantly'
  if (seconds < 60) return `${Math.round(seconds)} seconds`
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`
  if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`
  if (seconds < 3.154e9) return `${Math.round(seconds / 31536000)} years`
  if (seconds < 3.154e12) return `${(seconds / 3.154e9).toFixed(0)}K years`
  return 'Billions of years'
}

export function analyzePassword(password: string): PasswordAnalysis {
  if (!password) {
    return {
      entropy: 0,
      strength: 'very-weak',
      strengthLabel: 'Very Weak',
      characterSets: { lowercase: false, uppercase: false, numbers: false, symbols: false },
      suggestions: ['Enter a password to analyze'],
      bruteForceTime: 'Instantly',
    }
  }
  const entropy = calculateEntropy(password)
  const strength = classifyPassword(entropy)
  const characterSets = {
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    numbers: /[0-9]/.test(password),
    symbols: /[^a-zA-Z0-9]/.test(password),
  }
  const suggestions: string[] = []
  if (password.length < 12) suggestions.push('Use at least 12 characters')
  if (password.length < 16) suggestions.push('16+ characters is recommended')
  if (!characterSets.uppercase) suggestions.push('Add uppercase letters (A–Z)')
  if (!characterSets.lowercase) suggestions.push('Add lowercase letters (a–z)')
  if (!characterSets.numbers) suggestions.push('Add numbers (0–9)')
  if (!characterSets.symbols) suggestions.push('Add symbols (!@#$%^&*)')
  if (/(.)\1{2,}/.test(password)) suggestions.push('Avoid repeating characters')
  if (suggestions.length === 0) suggestions.push('Excellent password!')

  return {
    entropy,
    strength,
    strengthLabel: strengthLabel(strength),
    characterSets,
    suggestions,
    bruteForceTime: estimateBruteForceTime(entropy),
  }
}
