import type {NextConfig} from 'next'

import withBundleAnalyzer from '@next/bundle-analyzer'

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: true,
  },
  compiler: {
    styledComponents: {
      displayName: true,
    },
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
}

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(
  // @ts-ignore - typings need to be fixed upstream
  nextConfig,
)
