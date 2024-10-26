import type {SanityNode} from '@repo/visual-editing-helpers'

export function getArrayItemKeyAndParentPath(pathOrNode: string | SanityNode): {
  path: string
  key: string
} {
  const elementPath = typeof pathOrNode === 'string' ? pathOrNode : pathOrNode.path
  const result = elementPath.match(/^(.+)\[_key=="(.+)"]$/)
  if (!result) throw new Error('Invalid path')
  const [, path, key] = result
  if (!path || !key) throw new Error('Invalid path')
  return {path, key}
}
