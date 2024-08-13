/**
 * Data resolved from a Sanity node
 * @public
 */
export type SanityNode = {
  baseUrl: string
  dataset?: string
  id: string
  isDraft?: string
  path: string
  projectId?: string
  tool?: string
  type?: string
  workspace?: string
}

/**
 * Data resolved from a Sanity Stega node
 * @public
 */
export type SanityStegaNode = {
  origin: string
  href: string
  data?: unknown
}
