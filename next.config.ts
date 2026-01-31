import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  basePath: process.env.BASEPATH,

  // Performance optimizations
  compress: true,
  poweredByHeader: false,

  // Disable source maps in production for smaller bundle
  productionBrowserSourceMaps: false,

  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000, // 1 year cache
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'api.local',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: '**.ptrniger.com',
        pathname: '/**'
      }
    ]
  },

  // Optimize package imports for better tree-shaking
  experimental: {
    optimizePackageImports: [
      '@mui/material',
      '@mui/icons-material',
      '@mui/lab',
      '@tanstack/react-query',
      '@tanstack/react-table',
      'lodash',
      'date-fns',
    ],
  },

  redirects: async () => {
    return [
      {
        source: '/:lang(en|fr|ar)',
        destination: '/:lang/',
        permanent: true,
        locale: false
      }
    ]
  },

  // Headers for caching static assets
  headers: async () => {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

export default nextConfig
