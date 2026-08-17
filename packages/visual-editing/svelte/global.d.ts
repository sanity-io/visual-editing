import {SanityClientLike} from '@sanity/visual-editing-types'

import {VisualEditingLocals} from './types'

declare global {
  namespace App {
    // Parameterised with the structural type rather than taking the `SanityClient` default: this
    // declaration is only for building this package, where all we know about the client is what
    // `handlePreview` was handed. Consumers get the default, keeping the full client API.
    interface Locals extends VisualEditingLocals<SanityClientLike> {}
  }
}
