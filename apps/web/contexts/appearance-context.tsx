"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

// ─── Accent presets (label → OKLCH primary value) ─────────────────────────
export const ACCENT_PRESETS = [
  { label: 'Green',  hex: '#22c55e', oklch: 'oklch(0.72 0.22 142)' },
  { label: 'Blue',   hex: '#3b82f6', oklch: 'oklch(0.65 0.20 240)' },
  { label: 'Purple', hex: '#8b5cf6', oklch: 'oklch(0.65 0.20 290)' },
  { label: 'Amber',  hex: '#f59e0b', oklch: 'oklch(0.78 0.18 80)'  },
  { label: 'Pink',   hex: '#ec4899', oklch: 'oklch(0.65 0.22 355)' },
  { label: 'Cyan',   hex: '#06b6d4', oklch: 'oklch(0.72 0.16 200)' },
] as const

export type Theme = 'dark' | 'light' | 'system'
export type AccentHex = (typeof ACCENT_PRESETS)[number]['hex']

interface AppearanceState {
  theme: Theme
  accent: AccentHex
  setTheme: (t: Theme) => void
  setAccent: (hex: AccentHex) => void
}

const AppearanceContext = createContext<AppearanceState>({
  theme: 'dark',
  accent: '#22c55e',
  setTheme: () => {},
  setAccent: () => {},
})

// ─── Apply theme class to <html> ──────────────────────────────────────────
function applyTheme(theme: Theme) {
  const html = document.documentElement
  html.classList.remove('light', 'dark')

  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (!prefersDark) html.classList.add('light')
    // CryptoVault :root is already dark, so dark = no class needed
  } else if (theme === 'light') {
    html.classList.add('light')
  }
  // 'dark' = no class (default :root is already dark)
}

// ─── Apply accent CSS variables to :root ─────────────────────────────────
function applyAccent(hex: AccentHex) {
  const preset = ACCENT_PRESETS.find(p => p.hex === hex)
  if (!preset) return
  const root = document.documentElement
  root.style.setProperty('--primary', preset.oklch)
  root.style.setProperty('--ring', preset.oklch)
  root.style.setProperty('--sidebar-primary', preset.oklch)
  root.style.setProperty('--sidebar-ring', preset.oklch)
  root.style.setProperty('--chart-1', preset.oklch)
}

// ─── Provider ─────────────────────────────────────────────────────────────
export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark')
  const [accent, setAccentState] = useState<AccentHex>('#22c55e')

  // Load from localStorage on mount and apply immediately
  useEffect(() => {
    const savedTheme  = (localStorage.getItem('cv-theme')  ?? 'dark')  as Theme
    const savedAccent = (localStorage.getItem('cv-accent') ?? '#22c55e') as AccentHex
    setThemeState(savedTheme)
    setAccentState(savedAccent)
    applyTheme(savedTheme)
    applyAccent(savedAccent)
  }, [])

  // Listen for system preference changes when theme === 'system'
  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme('system')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t)
    localStorage.setItem('cv-theme', t)
    applyTheme(t)
  }, [])

  const setAccent = useCallback((hex: AccentHex) => {
    setAccentState(hex)
    localStorage.setItem('cv-accent', hex)
    applyAccent(hex)
  }, [])

  return (
    <AppearanceContext.Provider value={{ theme, accent, setTheme, setAccent }}>
      {children}
    </AppearanceContext.Provider>
  )
}

export const useAppearance = () => useContext(AppearanceContext)
