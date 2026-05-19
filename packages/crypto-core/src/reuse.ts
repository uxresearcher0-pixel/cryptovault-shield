import type { Credential } from './types'

const REUSE_KEY_MATERIAL = 'cv-reuse-detection-v1'

async function getHmacKey(): Promise<CryptoKey> {
  const enc = new TextEncoder()
  const raw = await crypto.subtle.importKey(
    'raw',
    enc.encode(REUSE_KEY_MATERIAL),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: enc.encode('cv-salt'), iterations: 1000, hash: 'SHA-256' },
    raw,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
}

export async function hashPasswordForReuse(password: string): Promise<string> {
  const key = await getHmacKey()
  const enc = new TextEncoder()
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(password))
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
}

export async function detectPasswordReuse(
  credentials: Credential[],
): Promise<Set<string>> {
  const hashMap = new Map<string, string>()
  const reusedIds = new Set<string>()
  for (const cred of credentials) {
    const hash = await hashPasswordForReuse(cred.password)
    if (hashMap.has(hash)) {
      reusedIds.add(cred.id)
      reusedIds.add(hashMap.get(hash)!)
    } else {
      hashMap.set(hash, cred.id)
    }
  }
  return reusedIds
}
