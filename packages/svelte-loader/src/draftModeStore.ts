import { get, writable } from 'svelte/store'

export const draftMode = writable(false)

export const setDraftMode = draftMode.set

export const draftModeEnabled = (): boolean => get(draftMode)
