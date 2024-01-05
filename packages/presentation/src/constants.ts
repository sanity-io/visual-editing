import { ComposeIcon } from '@sanity/icons'

export const DEFAULT_TOOL_ICON = ComposeIcon
export const DEFAULT_TOOL_NAME = 'presentation'
export const DEFAULT_TOOL_TITLE = 'Presentation'

export const EDIT_INTENT_MODE = 'presentation'

// How long we wait until an iframe is loaded until we consider it to be slow and possibly failed
export const MAX_TIME_TO_OVERLAYS_CONNECTION = 3000 // ms

// The API version to use when using `@sanity/client`
export const API_VERSION = '2023-10-16'

// Heartbeats shouldn't fire on intervals that are so short it causes performance issues
export const MIN_LOADER_QUERY_LISTEN_HEARTBEAT_INTERVAL = 1000 // ms

// Batch size for fetching documents building up the cache
export const LIVE_QUERY_CACHE_BATCH_SIZE = 100
