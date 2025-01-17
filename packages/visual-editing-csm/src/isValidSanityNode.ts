import type {SanityNode} from '@sanity/visual-editing-types'
import {is} from 'valibot'
import {sanityNodeSchema} from './sanityNodeSchema'

/** @internal */
export function isValidSanityNode(node: Partial<SanityNode>): node is SanityNode {
  return is(sanityNodeSchema, node)
}
