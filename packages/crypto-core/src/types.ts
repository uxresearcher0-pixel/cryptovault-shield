export type PasswordStrength = 'very-weak' | 'weak' | 'moderate' | 'strong' | 'very-strong'

export type Category =
  | 'social'
  | 'work'
  | 'finance'
  | 'personal'
  | 'email'
  | 'shopping'
  | 'gaming'
  | 'entertainment'
  | 'other'

export type AlertType =
  | 'breach'
  | 'reuse'
  | 'weak'
  | 'expired'
  | 'phishing'
  | 'mfa'

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical'

export type ViewType =
  | 'dashboard'
  | 'vault'
  | 'generator'
  | 'phishing'
  | 'report'
  | 'alerts'
  | 'settings'

export interface Credential {
  id: string
  userId: string
  site: string
  url?: string
  username: string
  password: string
  category: Category
  notes?: string
  createdAt: Date
  updatedAt: Date
  lastUsed?: Date
  mfaEnabled: boolean
  strength: PasswordStrength
  entropy: number
  tags?: string[]
}

export interface SecurityAlert {
  id: string
  userId: string
  type: AlertType
  severity: AlertSeverity
  title: string
  message: string
  credentialId?: string
  resolved: boolean
  createdAt: Date
}

export interface SecurityEvent {
  id: string
  userId: string
  type:
    | 'vault_unlock'
    | 'vault_lock'
    | 'credential_create'
    | 'credential_update'
    | 'credential_delete'
    | 'password_generate'
    | 'phishing_scan'
    | 'alert_dismissed'
    | 'vault_export'
  timestamp: Date
  details?: Record<string, unknown>
}

export interface PasswordAnalysis {
  entropy: number
  strength: PasswordStrength
  strengthLabel: string
  characterSets: {
    lowercase: boolean
    uppercase: boolean
    numbers: boolean
    symbols: boolean
  }
  suggestions: string[]
  bruteForceTime: string
}

export interface SecurityScore {
  total: number
  breakdown: {
    entropy: number
    uniqueness: number
    age: number
    mfa: number
    phishing: number
    breach: number
  }
}

export interface VaultStats {
  total: number
  weak: number
  reused: number
  noMfa: number
  old: number
  breached: number
}

export interface GeneratorOptions {
  length: number
  lowercase: boolean
  uppercase: boolean
  numbers: boolean
  symbols: boolean
  excludeAmbiguous: boolean
}
