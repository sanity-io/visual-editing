import { LRUCache } from 'lru-cache'

// Documents share the same cache even if there are nested providers, with a Least Recently Used (LRU) cache

export const documentsCache = new LRUCache({
  // Max 500 documents in memory, no big deal if a document is evicted it just means the eventual consistency might take longer
  max: 500,
})
