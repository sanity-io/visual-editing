import { SvelteComponent } from 'svelte'

import type { VisualEditingProps } from './types'

export * from './hooks'
export * from './types'
export class VisualEditing extends SvelteComponent<VisualEditingProps> {}
