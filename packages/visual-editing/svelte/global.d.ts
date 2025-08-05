import {VisualEditingLocals} from './types'

declare global {
  namespace App {
    interface Locals extends VisualEditingLocals {}
  }
}
