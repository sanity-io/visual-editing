import type {SanityNode} from '@repo/visual-editing-helpers'
import {at, insert, truncate, type NodePatchList} from '@sanity/mutate'
import type {OptimisticDocument} from '../ui/optimistic-state/useDocuments'

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

export function getArrayRemovePatches(node: SanityNode, doc: OptimisticDocument): NodePatchList {
  if (!node.type) throw new Error('Node type is missing')

  const {path: arrayPath, key: itemKey} = getArrayItemKeyAndParentPath(node)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - Type instantiation is excessively deep and possibly infinite.
  const arrayValue = doc.get(arrayPath) as {_key: string}[]
  const currentIndex = arrayValue.findIndex((item) => item._key === itemKey)

  return [at(arrayPath, truncate(currentIndex, currentIndex + 1))]
}

export function getArrayInsertPatches(
  node: SanityNode,
  doc: OptimisticDocument,
  insertType: string,
  position: 'before' | 'after',
): NodePatchList {
  if (!node.type) throw new Error('Node type is missing')
  const {path: arrayPath, key: itemKey} = getArrayItemKeyAndParentPath(node)

  const insertKey = Math.random().toString(36).slice(2, 5)
  const referenceItem = {_key: itemKey}

  return [at(arrayPath, insert([{_type: insertType, _key: insertKey}], position, referenceItem))]
}

export function getArrayMovePatches(
  node: SanityNode,
  doc: OptimisticDocument,
  moveTo: 'previous' | 'next' | 'first' | 'last',
): NodePatchList {
  if (!node.type) throw new Error('Node type is missing')
  const {path: arrayPath, key: itemKey} = getArrayItemKeyAndParentPath(node)

  const arrayValue = doc.get(arrayPath) as {_key: string}[]
  const itemValue = doc.get(node.path)
  const currentIndex = arrayValue.findIndex((item) => item._key === itemKey)

  let nextIndex = -1
  let position: 'before' | 'after' = 'before'

  if (moveTo === 'first') {
    if (currentIndex === 0) return []
    nextIndex = 0
    position = 'before'
  } else if (moveTo === 'last') {
    if (currentIndex === arrayValue.length - 1) return []
    nextIndex = -1
    position = 'after'
  } else if (moveTo === 'next') {
    if (currentIndex === arrayValue.length - 1) return []
    nextIndex = currentIndex
    position = 'after'
  } else if (moveTo === 'previous') {
    if (currentIndex === 0) return []
    nextIndex = currentIndex - 1
    position = 'before'
  }

  return [
    at(arrayPath, truncate(currentIndex, currentIndex + 1)),
    at(arrayPath, insert(itemValue, position, nextIndex)),
  ]
}
