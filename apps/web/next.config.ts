import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@cryptovault/crypto-core', '@cryptovault/threat-engine'],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
