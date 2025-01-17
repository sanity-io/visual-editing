import type {SanityStegaNode} from '@sanity/presentation-comlink'
import {vercelStegaDecode} from '@vercel/stega'
import {VERCEL_STEGA_REGEX} from '../constants'

/**
 * JavaScript regexps are stateful. Have to reset lastIndex between runs to ensure consistent behaviour for the same string
 * @param input
 */
function testVercelStegaRegex(input: string): boolean {
  VERCEL_STEGA_REGEX.lastIndex = 0
  return VERCEL_STEGA_REGEX.test(input)
}

function decodeStega(str: string, isAltText = false): SanityStegaNode | null {
  try {
    const decoded = vercelStegaDecode<SanityStegaNode>(str)
    if (!decoded || decoded.origin !== 'sanity.io') {
      return null
    }
    if (isAltText) {
      decoded.href = decoded.href?.replace('.alt', '')
    }
    return decoded
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to decode stega for string: ', str, 'with the original error: ', err)
    return null
  }
}

export function testAndDecodeStega(str: string, isAltText = false): SanityStegaNode | null {
  if (testVercelStegaRegex(str)) {
    return decodeStega(str, isAltText)
  }
  return null
}
