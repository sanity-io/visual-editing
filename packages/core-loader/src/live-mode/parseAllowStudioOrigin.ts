import { EnableLiveModeOptions } from '../types'

export function parseAllowStudioOrigin(
  unsafeAllowStudioOrigin: EnableLiveModeOptions['allowStudioOrigin'],
): string {
  return unsafeAllowStudioOrigin === 'same-origin'
    ? location.origin
    : new URL(unsafeAllowStudioOrigin, location.origin).origin
}
