import {LoaderLocals} from './types'

declare global {
  namespace App {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface Locals extends LoaderLocals {}
  }
}
