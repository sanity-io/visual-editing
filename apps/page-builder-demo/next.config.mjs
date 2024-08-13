import withBundleAnalyzer from '@next/bundle-analyzer'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactProductionProfiling: true,
  reactStrictMode: true,

  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  transpilePackages: ['apps-common'],
}

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(nextConfig)
