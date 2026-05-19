import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@cryptovault/crypto-core', '@cryptovault/threat-engine'],
}

export default nextConfig
