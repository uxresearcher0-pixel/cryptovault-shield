// ─── PBKDF2 Key Derivation ────────────────────────────────────────────────────

export async function deriveMasterKey(
  password: string,
  salt: Uint8Array,
): Promise<CryptoKey> {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 310_000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

// ─── AES-256-GCM Encryption ──────────────────────────────────────────────────

export async function encryptData(
  plaintext: string,
  key: CryptoKey,
): Promise<{ ciphertext: string; nonce: string }> {
  const enc = new TextEncoder()
  const nonce = crypto.getRandomValues(new Uint8Array(12))
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce },
    key,
    enc.encode(plaintext),
  )
  return {
    ciphertext: bufToBase64(new Uint8Array(encrypted)),
    nonce: bufToBase64(nonce),
  }
}

export async function decryptData(
  ciphertext: string,
  nonce: string,
  key: CryptoKey,
): Promise<string> {
  const dec = new TextDecoder()
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: base64ToBuf(nonce) },
    key,
    base64ToBuf(ciphertext),
  )
  return dec.decode(decrypted)
}

// ─── Master Password Hash (for login verification) ───────────────────────────

export async function hashMasterPassword(password: string): Promise<string> {
  const enc = new TextEncoder()
  const salt = enc.encode('cryptovault-master-salt-v1')
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    keyMaterial,
    256,
  )
  return bufToBase64(new Uint8Array(bits))
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function bufToBase64(buf: Uint8Array): string {
  return btoa(String.fromCharCode(...buf))
}

export function base64ToBuf(b64: string): Uint8Array {
  return new Uint8Array(atob(b64).split('').map(c => c.charCodeAt(0)))
}

export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16))
}
