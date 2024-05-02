function requireResolve(id) {
  return import.meta.resolve(id).replace('file://', '')
}

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
      '@sanity/presentation': requireResolve('@sanity/presentation'),
      '@sanity/vision': requireResolve('@sanity/vision'),
      'sanity/_singletons': requireResolve('sanity/_singletons'),
      'sanity/desk': requireResolve('sanity/desk'),
      'sanity/presentation': requireResolve('sanity/presentation'),
      'sanity/router': requireResolve('sanity/router'),
      'sanity/structure': requireResolve('sanity/structure'),
      sanity: requireResolve('sanity'),
    }
    return config
  },
}

export default config
