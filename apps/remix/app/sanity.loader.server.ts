import {loadQuery as server__loadQuery, setServerClient} from '@sanity/react-loader'

import {client} from './sanity'

setServerClient(client)

export {server__loadQuery as loadQuery}
