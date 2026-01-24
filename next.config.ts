import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  basePath: process.env.BASEPATH,
  eslint: {
    // Désactiver ESLint pendant le build
    ignoreDuringBuilds: true
  },
  typescript: {
    // Désactiver les vérifications TypeScript pendant le build
    ignoreBuildErrors: true
  },
  images: {
    // Autoriser les images depuis l'API
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'api.local',
        pathname: '/**'
      }
    ]
  },
  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/',
        permanent: true,
        locale: false
      },
      {
        source: '/:lang(en|fr|ar)',
        destination: '/:lang/',
        permanent: true,
        locale: false
      },
      {
        source: '/((?!(?:en|fr|ar|front-pages|favicon.ico|api)\\b)):path',
        destination: '/en/:path',
        permanent: true,
        locale: false
      }
    ]
  }
}

export default nextConfig
