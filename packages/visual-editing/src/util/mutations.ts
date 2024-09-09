import type {SanityNode} from '@repo/visual-editing-helpers'
import type {SanityDocument} from '@sanity/client'
import {at, createIfNotExists, insert, patch, truncate, type Mutation} from '@sanity/mutate'
import {get} from '@sanity/util/paths'
import {getDraftId} from './documents'

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

export function getArrayRemoveMutations(
  node: SanityNode,
  sanityDocument: SanityDocument,
): Mutation[] {
  if (!node.type) throw new Error('Node type is missing')
  const documentId = getDraftId(node.id)
  const documentType = node.type

  const {path: arrayPath, key: itemKey} = getArrayItemKeyAndParentPath(node)
  const arrayValue = get(sanityDocument, arrayPath) as {_key: string}[]
  const currentIndex = arrayValue.findIndex((item) => item._key === itemKey)

  return [
    createIfNotExists({_id: documentId, _type: documentType}),
    patch(documentId, at(arrayPath, truncate(currentIndex, currentIndex + 1))),
  ]
}

export function getArrayInsertMutations(
  node: SanityNode,
  insertType: string,
  position: 'before' | 'after',
): Mutation[] {
  if (!node.type) throw new Error('Node type is missing')
  const {path: arrayPath, key: itemKey} = getArrayItemKeyAndParentPath(node)
  const documentId = getDraftId(node.id)
  const documentType = node.type

  const insertKey = Math.random().toString(36).slice(2, 5)
  const referenceItem = {_key: itemKey}

  return [
    createIfNotExists({_id: documentId, _type: documentType}),
    patch(
      documentId,
      at(arrayPath, insert([{_type: insertType, _key: insertKey}], position, referenceItem)),
    ),
  ]
}

export function getArrayMoveMutations(
  node: SanityNode,
  sanityDocument: SanityDocument,
  moveTo: 'previous' | 'next' | 'first' | 'last',
): Mutation[] | undefined {
  if (!node.type) throw new Error('Node type is missing')
  const {path: arrayPath, key: itemKey} = getArrayItemKeyAndParentPath(node)
  const documentId = getDraftId(node.id)
  const documentType = node.type

  const arrayValue = get(sanityDocument, arrayPath) as {_key: string}[]
  const itemValue = get(sanityDocument, node.path)
  const currentIndex = arrayValue.findIndex((item) => item._key === itemKey)

  let nextIndex = -1
  let position: 'before' | 'after' = 'before'

  if (moveTo === 'first') {
    if (currentIndex === 0) return undefined
    nextIndex = 0
    position = 'before'
  } else if (moveTo === 'last') {
    if (currentIndex === arrayValue.length - 1) return undefined
    nextIndex = -1
    position = 'after'
  } else if (moveTo === 'next') {
    if (currentIndex === arrayValue.length - 1) return undefined
    nextIndex = currentIndex
    position = 'after'
  } else if (moveTo === 'previous') {
    if (currentIndex === 0) return undefined
    nextIndex = currentIndex - 1
    position = 'before'
  }

  return [
    createIfNotExists({_id: documentId, _type: documentType}),
    patch(documentId, at(arrayPath, truncate(currentIndex, currentIndex + 1))),
    patch(documentId, at(arrayPath, insert(itemValue, position, nextIndex))),
  ]
}
