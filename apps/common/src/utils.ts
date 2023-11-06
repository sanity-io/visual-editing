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
