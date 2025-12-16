import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  images: {
    remotePatterns: [{hostname: 'cdn.sanity.io'}, {hostname: 'source.unsplash.com'}],
  },

  reactCompiler: true,
} satisfies NextConfig

export default nextConfig
