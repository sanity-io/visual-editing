/* eslint-disable no-console */
// Common utils used in templates, demos and tests.
// The JS in here needs to be able to run server side, browser side, in any fw

import { vercelStegaSplit } from '@vercel/stega'

export function formatCurrency(_value: number | string): string {
  let value = typeof _value === 'string' ? undefined : _value
  let encoded = ''
  if (typeof _value === 'string') {
    const split = vercelStegaSplit(_value)
    value = parseInt(split.cleaned, 10)
    encoded = split.encoded
  }
  const formatter = new Intl.NumberFormat('en', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
  return `${formatter.format(value!)}${encoded}`
}

const rtf = new Intl.RelativeTimeFormat('en', { style: 'short' })
export function formatTimeSince(from: Date, to: Date): string {
  const seconds = Math.floor((from.getTime() - to.getTime()) / 1000)
  if (seconds > -60) {
    return rtf.format(Math.min(seconds, -1), 'second')
  }
  const minutes = Math.ceil(seconds / 60)
  if (minutes > -60) {
    return rtf.format(minutes, 'minute')
  }
  const hours = Math.ceil(minutes / 60)
  // if(hours > -24) {
  return rtf.format(hours, 'hour')
  // }
}
