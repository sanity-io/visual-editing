import {LoaderLocals} from './types'

declare global {
  namespace App {
    interface Locals extends LoaderLocals {}
  }
}
