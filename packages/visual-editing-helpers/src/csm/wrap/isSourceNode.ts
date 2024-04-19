import {isRecord} from './helpers'
import type {SourceNode} from './types'

export function isSourceNode(t: unknown): t is SourceNode {
  return isRecord(t) && t['$$type$$'] === 'sanity'
}
