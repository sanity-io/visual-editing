import {SanityClientLike} from '@sanity/core-loader'

import {LoaderLocals} from './types'

declare global {
  namespace App {
    // Parameterised with the structural type rather than taking the `SanityClient` default: this
    // declaration is only for building this package, where the client may come from
    // `unstable__serverClient`. Consumers get the default, keeping the full client API.
    interface Locals extends LoaderLocals<SanityClientLike> {}
  }
}
