import type { ClientPerspective } from '@sanity/client'

export function getTurboCacheKey(
  projectId: string,
  dataset: string,
  perspective: ClientPerspective,
  // type: string,
  id: string,
): `${string}-${string}-${string}` {
  return `${projectId}-${dataset}-${perspective}-${id}`
}
