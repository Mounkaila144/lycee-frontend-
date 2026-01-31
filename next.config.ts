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
        source: '/:lang(en|fr|ar)',
        destination: '/:lang/',
        permanent: true,
        locale: false
      }
    ]
  }
}

export default nextConfig
