import { createQueryStore } from '@sanity/nuxt-loader'
import { getClient } from '@/utils'

const client = getClient()

export const { useQuery, useLiveMode } = createQueryStore({ client })
