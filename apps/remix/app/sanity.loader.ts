import { createQueryStore } from '@sanity/react-loader'

export const {
  loadQuery: server__loadQuery,
  useQuery,
  setServerClient,
  useLiveMode,
} = createQueryStore({ client: false, ssr: true })
