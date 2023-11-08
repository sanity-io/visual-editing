import { client } from './sanity'
import { server__query, setServerClient } from './sanity.loader'

setServerClient(client)

export { server__query as query }
