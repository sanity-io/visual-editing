// See https://kit.svelte.dev/docs/types#app
import type { LoadQuery } from '@sanity/svelte-loader'
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      loadQuery: LoadQuery
      preview: boolean
    }
    // interface PageData {}
    // interface Platform {}
  }
}

export {}
