import { VisualEditingLocals } from './lib/types'

declare global {
  namespace App {
    interface Locals extends VisualEditingLocals {}
  }
}
