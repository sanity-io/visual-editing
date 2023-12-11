import { useMemo } from 'react'

/**
 * @deprecated
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
