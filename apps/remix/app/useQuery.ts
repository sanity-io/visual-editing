import { createQueryStore } from '@sanity/react-loader'
import { getClient } from '~/utils'

const client = getClient()

export const { useQuery, useLiveMode } = createQueryStore({ client })
