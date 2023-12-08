import withBundleAnalyzer from '@next/bundle-analyzer'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  transpilePackages: [
    '@sanity/overlays',
    '@sanity/preview-kit-compat',
    '@sanity/channels',
    '@sanity/visual-editing-helpers',
    'apps-common',
  ],

  // We run these checks in the CI pipeline, so we don't need to run them on Vercel
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      { hostname: 'cdn.sanity.io' },
      { hostname: 'source.unsplash.com' },
    ],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `frame-ancestors 'self' https://*.sanity.build http://localhost:3333`,
          },
        ],
      },
    ]
  },
}

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(nextConfig)
