import { createQueryStore } from '@sanity/react-loader'

export const {
  query: server__query,
  useQuery,
  setServerClient,
  useLiveMode,
} = createQueryStore({ client: false, ssr: true })
