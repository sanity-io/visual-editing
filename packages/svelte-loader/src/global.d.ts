import { LoadQuery } from './types'

declare global {
  namespace App {
    export interface Locals {
      draftMode: boolean
      loadQuery: LoadQuery
    }
  }
}
