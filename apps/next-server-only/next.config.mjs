import withBundleAnalyzer from '@next/bundle-analyzer'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

/** @type {import('next').NextConfig} */
const nextConfig = {
  // reactStrictMode: true,
  /*
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  // */

  transpilePackages: [
    '@sanity/channels',
    'apps-common',
    '@sanity/presentation',
    'sanity',
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

  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      'sanity/_internal': require.resolve('sanity/_internal'),
      'sanity/_internalBrowser': require.resolve('sanity/_internalBrowser'),
      'sanity/cli': require.resolve('sanity/cli'),
      'sanity/desk': require.resolve('sanity/desk'),
      'sanity/router': require.resolve('sanity/router'),
      'sanity/structure': require.resolve('sanity/structure'),
      sanity: require.resolve('sanity'),
    }
    return config
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
}

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(nextConfig)
