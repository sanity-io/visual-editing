import withBundleAnalyzer from '@next/bundle-analyzer'
import {createRequire} from 'node:module'

const require = createRequire(import.meta.url)

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

  transpilePackages: ['@repo/channels', 'apps-common', '@sanity/presentation', 'sanity'],

  images: {
    remotePatterns: [{hostname: 'cdn.sanity.io'}, {hostname: 'source.unsplash.com'}],
  },

  experimental: {
    ppr: true,
    staticWorkerRequestDeduping: true,
    taint: true,
  },

  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      'sanity/_internal': require.resolve('sanity/_internal'),
      'sanity/_singletons': require.resolve('sanity/_singletons'),
      'sanity/cli': require.resolve('sanity/cli'),
      'sanity/desk': require.resolve('sanity/desk'),
      'sanity/router': require.resolve('sanity/router'),
      'sanity/structure': require.resolve('sanity/structure'),
      'sanity': require.resolve('sanity'),
    }
    return config
  },
}

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(nextConfig)
