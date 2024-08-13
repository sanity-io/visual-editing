import {withVercelToolbar} from '@vercel/toolbar/plugins/next'
import withBundleAnalyzer from '@next/bundle-analyzer'
import {createRequire} from 'node:module'

const require = createRequire(import.meta.url)

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  reactProductionProfiling: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  transpilePackages: ['apps-common'],

  images: {
    remotePatterns: [{hostname: 'cdn.sanity.io'}, {hostname: 'source.unsplash.com'}],
  },

  experimental: {
    taint: true,
    reactCompiler: true,
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `frame-ancestors 'self' https://*.sanity.build https://*.sanity.dev http://localhost:3333`,
          },
        ],
      },
    ]
  },
}

export default withVercelToolbar()(
  withBundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
  })(nextConfig),
)
