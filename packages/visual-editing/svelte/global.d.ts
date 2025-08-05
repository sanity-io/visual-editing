import {VisualEditingLocals} from './types'

declare global {
  namespace App {
    // eslint-disable-next-line @typescript-eslint/ban-types
    interface Locals extends VisualEditingLocals {}
  }
}
