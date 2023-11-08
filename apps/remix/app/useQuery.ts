import { createQueryStore } from '@sanity/react-loader'
import { getClient } from '~/utils'

const client = getClient()

export const { query, useQuery, useLiveMode } = createQueryStore({ client })
