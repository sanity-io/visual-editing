import {DRAFTS_PREFIX} from '@repo/visual-editing-helpers/csm'

export function isDraftId(id: string): boolean {
  return id.startsWith(DRAFTS_PREFIX)
}

export function getDraftId(id: string): string {
  return isDraftId(id) ? id : DRAFTS_PREFIX + id
}

export function getPublishedId(id: string): string {
  return isDraftId(id) ? id.slice(DRAFTS_PREFIX.length) : id
}
