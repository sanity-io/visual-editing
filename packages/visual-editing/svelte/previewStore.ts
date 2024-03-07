import { readonly, writable } from 'svelte/store'

const previewStore = writable(false)

/**
 * @beta
 */
export const isPreviewing = readonly(previewStore)

/**
 * @beta
 */
export const setPreviewing = previewStore.set
