export {VERCEL_STEGA_REGEX} from '@vercel/stega'

/**
 * How long to wait after the last subscriber has unsubscribed before resetting the observable and disconnecting the listener
 * We want to keep the listener alive for a short while after the last subscriber has unsubscribed to avoid unnecessary reconnects
 */
export const LISTENER_RESET_DELAY = 2000
