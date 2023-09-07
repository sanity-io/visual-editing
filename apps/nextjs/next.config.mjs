import withBundleAnalyzer from '@next/bundle-analyzer'

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    logging: 'verbose',
  },

  // todo: maybe remove this in production mode?
  transpilePackages: ['@sanity/composer', '@sanity/overlays'],
}

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(nextConfig)
