import { useMemo } from 'react'

/**
 * The origin that are allowed to connect to the overlay.
 * @example 'https://my.sanity.studio'
 * @example location.origin
 * @example 'same-origin'
 * @public
 */
export type AllowStudioOrigin =
  | 'same-origin'
  | `https://${string}`
  | `http://${string}`
  | string

export function useAllowStudioOrigin(
  unsafeAllowStudioOrigin: AllowStudioOrigin,
): string {
  return useMemo(() => {
    // previewUrl might be relative, if it is we set `targetOrigin` to the same origin as the Studio
    // if it's an absolute URL we extract the origin from it
    return unsafeAllowStudioOrigin === 'same-origin'
      ? location.origin
      : new URL(unsafeAllowStudioOrigin, location.origin).origin
  }, [unsafeAllowStudioOrigin])
}
