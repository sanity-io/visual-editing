import { createQueryStore } from '@sanity/react-loader'
import { studioUrl } from 'apps-common/env'
import { getClient } from './utils'

const client = getClient()

export const { useQuery, useLiveMode } = createQueryStore({ client, studioUrl })
