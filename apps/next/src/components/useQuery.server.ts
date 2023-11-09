import { client } from './sanity'
import { query, setServerClient } from './useQuery'

setServerClient(client)

export { query }
