import { client } from './sanity'
import { server__loadQuery, setServerClient } from './sanity.loader'

setServerClient(client)

export { server__loadQuery as loadQuery }
