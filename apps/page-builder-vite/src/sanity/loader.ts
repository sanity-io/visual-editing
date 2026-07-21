import {createQueryStore} from '@sanity/react-loader'

import {client} from './client'

export const {useQuery, useLiveMode} = createQueryStore({client})
