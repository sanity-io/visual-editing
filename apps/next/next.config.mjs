import {createRequire} from 'node:module'
import withBundleAnalyzer from '@next/bundle-analyzer'
import {withVercelToolbar} from '@vercel/toolbar/plugins/next'

const require = createRequire(import.meta.url)

/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: {
      displayName: true,
    },
  },
  reactStrictMode: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  images: {
    remotePatterns: [{hostname: 'cdn.sanity.io'}, {hostname: 'source.unsplash.com'}],
  },

  transpilePackages: ['@repo/env'],

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
