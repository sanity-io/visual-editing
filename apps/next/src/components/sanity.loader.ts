import { createQueryStore } from '@sanity/react-loader'

const { useQuery, useLiveMode, ...serverOnly } = createQueryStore({
  client: false,
  ssr: true,
})

/**
 * Exports to be used in client-only or components that render both server and client
 */
export { useQuery, useLiveMode }

/**
 * Exports for `sanity.ssr.ts`
 */
export { serverOnly }
