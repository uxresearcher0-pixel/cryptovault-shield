import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { VaultProvider } from '@/contexts/vault-context'
import { AppearanceProvider } from '@/contexts/appearance-context'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    template: '%s | CryptoVault',
    default: 'CryptoVault — Zero-Knowledge Password Manager',
  },
  description:
    'Secure your digital life with military-grade AES-256-GCM encryption, real-time phishing detection, and AI-powered security intelligence.',
  keywords: ['password manager', 'zero-knowledge', 'encryption', 'security', 'phishing protection'],
  authors: [{ name: 'Shahriar Shanto' }],
  creator: 'Shahriar Shanto',
  metadataBase: new URL('https://cryptovault.shahriarshanto.online'),
  openGraph: {
    title: 'CryptoVault — Zero-Knowledge Password Manager',
    description: 'Military-grade password security with real-time threat intelligence.',
    type: 'website',
    locale: 'en_US',
  },
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  themeColor: '#0a0a1a',
  colorScheme: 'dark',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground font-sans">
        <AppearanceProvider>
          <VaultProvider>{children}</VaultProvider>
        </AppearanceProvider>
      </body>
    </html>
  )
}
