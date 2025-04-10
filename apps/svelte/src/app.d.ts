// See https://kit.svelte.dev/docs/types#app
import type {LoaderLocals} from '@sanity/svelte-loader'

// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface Locals extends LoaderLocals {}
    // interface PageData {}
    // interface Platform {}
  }
}

export {}
