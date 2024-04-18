import {client} from './sanity'
import {loadQuery as server__loadQuery, setServerClient} from '@sanity/react-loader'

setServerClient(client)

export {server__loadQuery as loadQuery}
