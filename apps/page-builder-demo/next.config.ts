import type {NextConfig} from 'next'


const nextConfig: NextConfig = {
  reactCompiler: true,
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
