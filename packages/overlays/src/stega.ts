import { vercelStegaDecode } from '@vercel/stega'

import { VERCEL_STEGA_REGEX } from './constants'

/**
 * JavaScript regexps are stateful. Have to reset lastIndex between runs to ensure consistent behaviour for the same string
 * @param input
 */
export function testVercelStegaRegex(input: string): boolean {
  VERCEL_STEGA_REGEX.lastIndex = 0
  return VERCEL_STEGA_REGEX.test(input)
}

export function decodeStega(str: string, isAltText = false): string {
  const decoded = vercelStegaDecode<{
    origin?: string
    href?: string
    data?: unknown
  }>(str)
  if (!decoded || decoded.origin !== 'sanity.io') {
    return ''
  }
  if (isAltText) {
    decoded.href = decoded.href?.replace('.alt', '')
  }
  decoded.href += ';view=preview,'
  return JSON.stringify(decoded)
}

export function testAndDecodeStega(str: string, isAltText = false): string {
  if (testVercelStegaRegex(str)) {
    return decodeStega(str, isAltText)
  }
  return ''
}
