import { VERCEL_STEGA_REGEX } from '@vercel/stega'

/**
 * JavaScript regexps are stateful. Have to reset lastIndex between runs to ensure consistent behaviour for the same string
 * @param input
 */
export function testVercelStegaRegex(input: string): boolean {
  VERCEL_STEGA_REGEX.lastIndex = 0
  return VERCEL_STEGA_REGEX.test(input)
}
