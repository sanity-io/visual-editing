import withBundleAnalyzer from '@next/bundle-analyzer'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  transpilePackages: [
    '@sanity/visual-editing',
    '@sanity/preview-kit-compat',
    '@sanity/channels',
    '@sanity/visual-editing-helpers',
    'apps-common',
  ],

  images: {
    remotePatterns: [
      { hostname: 'cdn.sanity.io' },
      { hostname: 'source.unsplash.com' },
    ],
  },

  experimental: {
    taint: true,
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `frame-ancestors 'self' https://*.sanity.build http://localhost:3333`,
          },
        ],
      },
    ]
  },

  /*
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@sanity/visual-editing': require.resolve(
        '../../packages/visual-editing/src/index.ts',
      ),
    }
    return config
  },
  // */
}

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(nextConfig)
