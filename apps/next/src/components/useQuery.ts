import { createQueryStore } from '@sanity/react-loader'

export const { query, setServerClient, useQuery, useLiveMode } =
  createQueryStore({ client: false, ssr: true })
