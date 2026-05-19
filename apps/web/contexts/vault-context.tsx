"use client"

import React, { createContext, useContext, useState, useCallback } from 'react'
import type { Credential, SecurityAlert, SecurityEvent } from '@cryptovault/crypto-core'
import { calculateSecurityScore, getVaultStats } from '@cryptovault/crypto-core'
import { MOCK_CREDENTIALS, MOCK_ALERTS, MOCK_EVENTS } from '@/lib/mock-data'

interface VaultContextValue {
  // Auth state
  isUnlocked: boolean
  unlock: (password: string) => Promise<boolean>
  lock: () => void

  // Credentials
  credentials: Credential[]
  addCredential: (cred: Omit<Credential, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void
  updateCredential: (id: string, updates: Partial<Credential>) => void
  deleteCredential: (id: string) => void

  // Alerts
  alerts: SecurityAlert[]
  resolveAlert: (id: string) => void

  // Events
  events: SecurityEvent[]

  // Derived
  securityScore: ReturnType<typeof calculateSecurityScore>
  vaultStats: ReturnType<typeof getVaultStats>

  // Search / filter
  searchQuery: string
  setSearchQuery: (q: string) => void
  selectedCategory: string
  setSelectedCategory: (c: string) => void
}

const VaultContext = createContext<VaultContextValue | null>(null)

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [credentials, setCredentials] = useState<Credential[]>(MOCK_CREDENTIALS)
  const [alerts, setAlerts] = useState<SecurityAlert[]>(MOCK_ALERTS)
  const [events] = useState<SecurityEvent[]>(MOCK_EVENTS)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const unlock = useCallback(async (password: string): Promise<boolean> => {
    // MVP: accept any non-empty password
    if (!password.trim()) return false
    setIsUnlocked(true)
    return true
  }, [])

  const lock = useCallback(() => {
    setIsUnlocked(false)
  }, [])

  const addCredential = useCallback((cred: Omit<Credential, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const newCred: Credential = {
      ...cred,
      id: `cred-${Date.now()}`,
      userId: 'user-001',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setCredentials(prev => [...prev, newCred])
  }, [])

  const updateCredential = useCallback((id: string, updates: Partial<Credential>) => {
    setCredentials(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c)),
    )
  }, [])

  const deleteCredential = useCallback((id: string) => {
    setCredentials(prev => prev.filter(c => c.id !== id))
  }, [])

  const resolveAlert = useCallback((id: string) => {
    setAlerts(prev => prev.map(a => (a.id === id ? { ...a, resolved: true } : a)))
  }, [])

  const securityScore = calculateSecurityScore(credentials)
  const vaultStats = getVaultStats(credentials)

  return (
    <VaultContext.Provider
      value={{
        isUnlocked,
        unlock,
        lock,
        credentials,
        addCredential,
        updateCredential,
        deleteCredential,
        alerts,
        resolveAlert,
        events,
        securityScore,
        vaultStats,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
      }}
    >
      {children}
    </VaultContext.Provider>
  )
}

export function useVault() {
  const ctx = useContext(VaultContext)
  if (!ctx) throw new Error('useVault must be used within VaultProvider')
  return ctx
}
