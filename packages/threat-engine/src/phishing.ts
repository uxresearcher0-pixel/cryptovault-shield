export interface PhishingResult {
  score: number
  decision: 'ALLOW' | 'WARN' | 'BLOCK'
  details: string[]
  url: string
  checkedAt: Date
}

const URL_SHORTENERS = new Set([
  'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly',
  'is.gd', 'buff.ly', 'rebrand.ly', 'cutt.ly', 'short.io',
])

const SUSPICIOUS_KEYWORDS = [
  'login', 'signin', 'sign-in', 'verify', 'verification',
  'secure', 'security', 'account', 'update', 'confirm',
  'banking', 'wallet', 'recover', 'unlock', 'validate',
  'credential', 'password', 'reset', 'auth',
]

function levenshtein(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  )
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[a.length][b.length]
}

export function analyzeURL(url: string, savedDomain?: string): PhishingResult {
  let score = 0
  const details: string[] = []
  const normalizedUrl = url.startsWith('http') ? url : `https://${url}`

  try {
    const urlObj = new URL(normalizedUrl)
    const domain = urlObj.hostname.toLowerCase()
    const fullUrl = normalizedUrl.toLowerCase()

    // D — domain mismatch (+25)
    if (savedDomain && domain !== savedDomain.toLowerCase()) {
      score += 25
      details.push(`Domain mismatch — expected "${savedDomain}", got "${domain}"`)
    }

    // L — lookalike domain (+30)
    if (savedDomain) {
      const dist = levenshtein(domain, savedDomain.toLowerCase())
      if (dist > 0 && dist <= 3) {
        score += 30
        details.push(`Lookalike domain — ${dist} char difference from "${savedDomain}"`)
      }
    }

    // P — punycode / IDN homograph (+20)
    if (domain.includes('xn--')) {
      score += 20
      details.push('Internationalized domain (Punycode) — possible homograph attack')
    }

    // K — suspicious keywords (+10)
    const pathQuery = (urlObj.pathname + urlObj.search).toLowerCase()
    const kw = SUSPICIOUS_KEYWORDS.find(k => pathQuery.includes(k))
    if (kw && savedDomain && domain !== savedDomain.toLowerCase()) {
      score += 10
      details.push(`Suspicious keyword in path: "${kw}"`)
    }

    // S — URL shortener (+15)
    if (URL_SHORTENERS.has(domain)) {
      score += 15
      details.push('URL shortener detected — destination is hidden')
    }

    // Insecure HTTP (+15)
    if (urlObj.protocol === 'http:') {
      score += 15
      details.push('Insecure HTTP — no TLS encryption')
    }

    // Excessive subdomains (+10)
    const parts = domain.split('.')
    if (parts.length > 4) {
      score += 10
      details.push(`Excessive subdomain nesting (${parts.length - 2} levels)`)
    }

    // IP address as domain (+30)
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(domain)) {
      score += 30
      details.push('IP address used instead of domain name')
    }

    // @ in URL (+20)
    if (fullUrl.includes('@')) {
      score += 20
      details.push('@ symbol in URL — credentials may be embedded')
    }

    // Multiple redirects (+10)
    if ((fullUrl.match(/https?:\/\//g) || []).length > 1) {
      score += 10
      details.push('Multiple URLs detected — possible redirect chain')
    }

    // Excessive length (+5)
    if (fullUrl.length > 100) {
      score += 5
      details.push('Unusually long URL')
    }

  } catch {
    score += 50
    details.push('Invalid or malformed URL')
  }

  score = Math.min(100, score)

  const decision: 'ALLOW' | 'WARN' | 'BLOCK' =
    score >= 70 ? 'BLOCK' : score >= 40 ? 'WARN' : 'ALLOW'

  return { score, decision, details, url, checkedAt: new Date() }
}
