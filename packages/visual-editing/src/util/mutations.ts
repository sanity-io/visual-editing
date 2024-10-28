import type {SanityNode} from '@repo/visual-editing-helpers'

export function getArrayItemKeyAndParentPath(pathOrNode: string | SanityNode): {
  path: string
  key: string
  hasExplicitKey: boolean
} {
  const elementPath = typeof pathOrNode === 'string' ? pathOrNode : pathOrNode.path

  const lastDotIndex = elementPath.lastIndexOf('.')
  const lastPathItem = elementPath.substring(lastDotIndex + 1, elementPath.length)

  if (!lastPathItem.indexOf('[')) throw new Error('Invalid path: not an array')

  const lastArrayIndex = elementPath.lastIndexOf('[')
  const path = elementPath.substring(0, lastArrayIndex)

  let key
  let hasExplicitKey

  if (lastPathItem.includes('_key')) {
    // explicit [_key="..."]

    const startIndex = lastPathItem.indexOf('"') + 1
    const endIndex = lastPathItem.indexOf('"', startIndex)

    key = lastPathItem.substring(startIndex, endIndex)

    hasExplicitKey = true
  } else {
    // indexes [int]
    const startIndex = lastPathItem.indexOf('[') + 1
    const endIndex = lastPathItem.indexOf(']', startIndex)

    key = lastPathItem.substring(startIndex, endIndex)

    hasExplicitKey = false
  }

  if (!path || !key) throw new Error('Invalid path')

  return {
    path,
    key,
    hasExplicitKey,
  }
}
