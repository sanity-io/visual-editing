import withBundleAnalyzer from '@next/bundle-analyzer'

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    logging: {
      level: 'verbose',
      fullUrl: true,
    },
  },

  transpilePackages: [
    '@sanity/overlays',
    '@sanity/react-loader',
    'apps-common',
    'channels',
    'visual-editing-helpers',
  ],

  // We run these checks in the CI pipeline, so we don't need to run them on Vercel
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
}

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(nextConfig)
