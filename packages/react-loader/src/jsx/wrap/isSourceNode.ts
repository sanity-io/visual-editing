import type {SourceNode} from './types'

import {isRecord} from './helpers'

export function isSourceNode(t: unknown): t is SourceNode {
  return isRecord(t) && t['$$type$$'] === 'sanity'
}
