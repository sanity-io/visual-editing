import type {NextConfig} from 'next'


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

export default nextConfig
