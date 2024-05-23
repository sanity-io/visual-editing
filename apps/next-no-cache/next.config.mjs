import withBundleAnalyzer from '@next/bundle-analyzer'

function requireResolve(id) {
  return import.meta.resolve(id).replace('file://', '')
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // /*
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  // */

  transpilePackages: ['@repo/channels', 'apps-common'],

  images: {
    remotePatterns: [{hostname: 'cdn.sanity.io'}, {hostname: 'source.unsplash.com'}],
  },

  experimental: {
    taint: true,
  },

  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@sanity/presentation': requireResolve('@sanity/presentation'),
      '@sanity/vision': requireResolve('@sanity/vision'),
      'sanity/_singletons': requireResolve('sanity/_singletons'),
      'sanity/desk': requireResolve('sanity/desk'),
      'sanity/presentation': requireResolve('sanity/presentation'),
      'sanity/router': requireResolve('sanity/router'),
      'sanity/structure': requireResolve('sanity/structure'),
      'sanity': requireResolve('sanity'),
      '@sanity/ui/theme': requireResolve('@sanity/ui/theme'),
      '@sanity/ui': requireResolve('@sanity/ui'),
      'styled-components': requireResolve('styled-components'),
    }
    return config
  },
}

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(nextConfig)
