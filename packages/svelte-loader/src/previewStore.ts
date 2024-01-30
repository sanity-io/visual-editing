import { get, writable } from 'svelte/store'

/**
 * @beta
 */
export const previewing = writable(false)

/**
 * @beta
 */
export const setPreviewing = previewing.set

/**
 * @beta
 */
export const previewEnabled = (): boolean => get(previewing)
