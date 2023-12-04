// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, test } from 'vitest'

import { useAllowStudioOrigin } from '../src/ui/useAllowStudioOrigin'

function TestPrinter(props: { allowStudioOrigin: string }) {
  return useAllowStudioOrigin(props.allowStudioOrigin)
}

describe('allowStudioOrigin handling', () => {
  test('same-origin', () => {
    const output = renderToStaticMarkup(
      <TestPrinter allowStudioOrigin="same-origin" />,
    )
    expect(output).toBe('http://localhost:3000')
  })

  test('Absolute URL', () => {
    const output = renderToStaticMarkup(
      <TestPrinter allowStudioOrigin="https://my.sanity.studio/" />,
    )
    expect(output).toBe('https://my.sanity.studio')
  })

  test('Relative URL', () => {
    const output = renderToStaticMarkup(
      <TestPrinter allowStudioOrigin="/studio" />,
    )
    expect(output).toBe('http://localhost:3000')
  })

  test('Invalid URL', () => {
    expect(() =>
      renderToStaticMarkup(<TestPrinter allowStudioOrigin="//" />),
    ).toThrowErrorMatchingInlineSnapshot('"Invalid URL"')
  })
})
