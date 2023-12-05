import { createQueryStore } from '@sanity/svelte-loader'

export const {
  loadQuery: server__loadQuery,
  useQuery,
  setServerClient,
  useLiveMode,
} = createQueryStore({ client: false, ssr: true })
