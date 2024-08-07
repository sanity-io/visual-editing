import path from 'node:path'
import sanityPkg from 'sanity/package.json' assert { type: 'json' }

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
const config = {
  images: {
    remotePatterns: [{ hostname: 'cdn.sanity.io' }],
  },
  typescript: {
    // Set this to false if you want production builds to abort if there's type errors
    ignoreBuildErrors: process.env.VERCEL_ENV === 'production',
  },
  eslint: {
    /// Set this to false if you want production builds to abort if there's lint errors
    ignoreDuringBuilds: process.env.VERCEL_ENV === 'production',
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
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
    }
    return config
  },
}

export default config
