import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: ['@repo/page-builder-shared'],
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

export default nextConfig
