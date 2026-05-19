import type { GeneratorOptions } from './types'

export function generatePassword(opts: GeneratorOptions): string {
  const sets = {
    lowercase: opts.excludeAmbiguous ? 'abcdefghjkmnpqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz',
    uppercase: opts.excludeAmbiguous ? 'ABCDEFGHJKMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numbers: opts.excludeAmbiguous ? '23456789' : '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  }

  let charset = ''
  const required: string[] = []

  if (opts.lowercase) {
    charset += sets.lowercase
    required.push(sets.lowercase[Math.floor(Math.random() * sets.lowercase.length)])
  }
  if (opts.uppercase) {
    charset += sets.uppercase
    required.push(sets.uppercase[Math.floor(Math.random() * sets.uppercase.length)])
  }
  if (opts.numbers) {
    charset += sets.numbers
    required.push(sets.numbers[Math.floor(Math.random() * sets.numbers.length)])
  }
  if (opts.symbols) {
    charset += sets.symbols
    required.push(sets.symbols[Math.floor(Math.random() * sets.symbols.length)])
  }

  if (!charset) charset = sets.lowercase + sets.uppercase + sets.numbers

  const array = new Uint32Array(opts.length)
  crypto.getRandomValues(array)

  let password = required.join('')
  for (let i = required.length; i < opts.length; i++) {
    password += charset[array[i] % charset.length]
  }

  // Fisher-Yates shuffle
  const chars = password.split('')
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }
  return chars.join('')
}
