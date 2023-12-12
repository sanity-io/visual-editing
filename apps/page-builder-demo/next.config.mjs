import withBundleAnalyzer from '@next/bundle-analyzer'

/** @type {import('next').NextConfig} */
const nextConfig = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  transpilePackages: [
    '@sanity/overlays',
    '@sanity/react-loader',
    'apps-common',
    '@sanity/channels',
    '@sanity/visual-editing-helpers',
  ],
}

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(nextConfig)
