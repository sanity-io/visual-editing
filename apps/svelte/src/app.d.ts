// See https://kit.svelte.dev/docs/types#app
import type {LoaderLocals} from '@sanity/svelte-loader'

// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals extends LoaderLocals {}
    // interface PageData {}
    // interface Platform {}
  }
}

export {}
