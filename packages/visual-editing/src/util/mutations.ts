import type {SanityDocument} from '@sanity/client'
import {at, insert, truncate, type NodePatchList} from '@sanity/mutate'
import type {SanityNode} from '@sanity/presentation-comlink'
import {get} from '@sanity/util/paths'
import type {OptimisticDocument} from '../optimistic/types'
import {randomKey} from './randomKey'

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

export function getArrayDuplicatePatches(
  node: SanityNode,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  snapshot: SanityDocument<Record<string, any>>,
  position: 'before' | 'after' = 'after',
): NodePatchList {
  const {path: arrayPath, key: itemKey} = getArrayItemKeyAndParentPath(node)

  const item = get(snapshot, node.path) as object
  const duplicate = {...item, _key: randomKey()}

  return [at(arrayPath, insert(duplicate, position, {_key: itemKey}))]
}

export function getArrayRemovePatches(
  node: SanityNode,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  snapshot: SanityDocument<Record<string, any>>,
): NodePatchList {
  const {path: arrayPath, key: itemKey} = getArrayItemKeyAndParentPath(node)
  const array = get(snapshot, arrayPath) as {_key: string}[]
  const currentIndex = array.findIndex((item) => item._key === itemKey)
  return [at(arrayPath, truncate(currentIndex, currentIndex + 1))]
}

export function getArrayInsertPatches(
  node: SanityNode,
  insertType: string,
  position: 'before' | 'after',
): NodePatchList {
  const {path: arrayPath, key: itemKey} = getArrayItemKeyAndParentPath(node)
  const insertKey = randomKey()
  const referenceItem = {_key: itemKey}
  return [at(arrayPath, insert([{_type: insertType, _key: insertKey}], position, referenceItem))]
}

export async function getArrayMovePatches(
  node: SanityNode,
  doc: OptimisticDocument,
  moveTo: 'previous' | 'next' | 'first' | 'last',
): Promise<NodePatchList> {
  if (!node.type) throw new Error('Node type is missing')
  const {path: arrayPath, key: itemKey} = getArrayItemKeyAndParentPath(node)

  const snapshot = await doc.getSnapshot()
  const array = get(snapshot, arrayPath) as {_key: string}[]
  const item = get(snapshot, node.path)
  const currentIndex = array.findIndex((item) => item._key === itemKey)

  let nextIndex = -1
  let position: 'before' | 'after' = 'before'

  if (moveTo === 'first') {
    if (currentIndex === 0) return []
    nextIndex = 0
    position = 'before'
  } else if (moveTo === 'last') {
    if (currentIndex === array.length - 1) return []
    nextIndex = -1
    position = 'after'
  } else if (moveTo === 'next') {
    if (currentIndex === array.length - 1) return []
    nextIndex = currentIndex
    position = 'after'
  } else if (moveTo === 'previous') {
    if (currentIndex === 0) return []
    nextIndex = currentIndex - 1
    position = 'before'
  }

  return [
    at(arrayPath, truncate(currentIndex, currentIndex + 1)),
    at(arrayPath, insert(item, position, nextIndex)),
  ]
}
