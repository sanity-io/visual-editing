import withBundleAnalyzer from '@next/bundle-analyzer'

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    taint: true,
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  transpilePackages: [
    '@sanity/visual-editing',
    'apps-common',
    '@repo/channels',
    '@repo/visual-editing-helpers',
  ],
}

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(nextConfig)
