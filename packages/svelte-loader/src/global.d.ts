import { LoadQuery } from './types'

declare global {
  namespace App {
    export interface Locals {
      preview: boolean
      loadQuery: LoadQuery
    }
  }
}
