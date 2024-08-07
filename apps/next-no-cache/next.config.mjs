import path from 'node:path'
import withBundleAnalyzer from '@next/bundle-analyzer'
import sanityPkg from 'sanity/package.json' assert {type: 'json'}

function requireResolve(id) {
  return import.meta.resolve(id).replace('file://', '')
}

const sanityExports = {}
for (const key of Object.keys(sanityPkg.exports)) {
  if (key === '.') continue
  const subexport = path.join('sanity', key)
  sanityExports[subexport] = requireResolve(subexport)
}
sanityExports['sanity'] = requireResolve('sanity')

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

  transpilePackages: ['apps-common'],

  images: {
    remotePatterns: [{hostname: 'cdn.sanity.io'}, {hostname: 'source.unsplash.com'}],
  },

  experimental: {
    taint: true,
  },

  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      ...sanityExports,
      '@sanity/presentation': requireResolve('@sanity/presentation'),
      '@sanity/vision': requireResolve('@sanity/vision'),
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
