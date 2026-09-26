import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  devIndicators: false,
  async redirects() {
    return [{ source: '/studio.html', destination: '/studio', permanent: false }]
  },
}

export default nextConfig
