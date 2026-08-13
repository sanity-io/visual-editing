import {studioTheme, ThemeProvider} from '@sanity/ui'
import {act, type ReactNode} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import {afterAll, afterEach, beforeAll, describe, expect, test, vi} from 'vitest'

import type {SanityNode} from '../types'
import {ElementOverlay} from './ElementOverlay'
import {
  PreviewSnapshotsContext,
  type PreviewSnapshotsContextValue,
} from './preview/PreviewSnapshotsContext'
import {SchemaContext, type SchemaContextValue} from './schema/SchemaContext'

const {supportsCssAnchorPositioningMock} = vi.hoisted(() => ({
  supportsCssAnchorPositioningMock: vi.fn(() => false),
}))

vi.mock('./cssAnchorPositioning', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./cssAnchorPositioning')>()
  return {
    ...actual,
    supportsCssAnchorPositioning: supportsCssAnchorPositioningMock,
  }
})

const actEnvironment = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean
}
const originalActEnvironment = actEnvironment.IS_REACT_ACT_ENVIRONMENT

beforeAll(() => {
  actEnvironment.IS_REACT_ACT_ENVIRONMENT = true
})

afterAll(() => {
  actEnvironment.IS_REACT_ACT_ENVIRONMENT = originalActEnvironment
})

const schemaValue: SchemaContextValue = {
  getField: () => ({field: undefined, parent: undefined}),
  getType: () => undefined,
}

const node: SanityNode = {
  id: 'doc',
  baseUrl: '/studio',
  path: 'title',
  type: 'page',
}

const emptyPreviewSnapshots: PreviewSnapshotsContextValue = []

function Wrapper({children}: {children: ReactNode}) {
  return (
    <ThemeProvider
      // oxlint-disable-next-line typescript/no-deprecated
      theme={studioTheme}
      scheme="light"
    >
      <SchemaContext.Provider value={schemaValue}>
        <PreviewSnapshotsContext.Provider value={emptyPreviewSnapshots}>
          {children}
        </PreviewSnapshotsContext.Provider>
      </SchemaContext.Provider>
    </ThemeProvider>
  )
}

describe('ElementOverlay', () => {
  const mounted: {container: HTMLElement; root: Root}[] = []
  const observers: {observe: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn>}[] = []
  let ioCallback: IntersectionObserverCallback | undefined

  beforeAll(() => {
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe = vi.fn()
        disconnect = vi.fn()
        unobserve = vi.fn()
        constructor(callback: IntersectionObserverCallback) {
          ioCallback = callback
          observers.push(this)
        }
      },
    )
  })

  afterAll(() => {
    vi.unstubAllGlobals()
  })

  afterEach(async () => {
    await act(async () => {
      for (const {container, root} of mounted) {
        root.unmount()
        container.remove()
      }
    })
    mounted.length = 0
    observers.length = 0
    ioCallback = undefined
    supportsCssAnchorPositioningMock.mockReturnValue(false)
  })

  async function renderOverlay(hovered = true) {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    mounted.push({container, root})

    await act(async () => {
      root.render(
        <Wrapper>
          <ElementOverlay
            inFrame={false}
            id="overlay-1"
            draggable={false}
            element={document.createElement('div')}
            focused={false}
            hovered={hovered}
            isDragging={false}
            node={node}
            rect={{x: 10, y: 20, w: 100, h: 50}}
            showActions={false}
            wasMaybeCollapsed={false}
            enableScrollIntoView={false}
            targets={[]}
            elementType="element"
          />
        </Wrapper>,
      )
    })

    return container
  }

  test('positions the overlay box with top/left so fixed labels can use the viewport', async () => {
    const container = await renderOverlay(false)
    const overlay = container.querySelector('[data-ui="Card"]') as HTMLElement | null
    expect(overlay).toBeTruthy()
    expect(overlay?.style.top).toBe('20px')
    expect(overlay?.style.left).toBe('10px')
    expect(overlay?.style.width).toBe('100px')
    expect(overlay?.style.height).toBe('50px')
    expect(overlay?.style.transform).toBe('')
  })

  test('falls back to IntersectionObserver flipping when CSS anchor positioning is unavailable', async () => {
    const container = await renderOverlay(true)
    expect(observers).toHaveLength(1)
    expect(observers[0]?.observe).toHaveBeenCalled()

    await act(async () => {
      ioCallback?.(
        [
          {
            boundingClientRect: {top: -8} as DOMRectReadOnly,
          } as IntersectionObserverEntry,
        ],
        observers[0] as unknown as IntersectionObserver,
      )
    })

    const overlay = container.querySelector('[data-hovered]') as HTMLElement | null
    expect(overlay?.hasAttribute('data-flipped')).toBe(true)
  })

  test('skips the IntersectionObserver fallback when CSS anchor positioning is supported', async () => {
    supportsCssAnchorPositioningMock.mockReturnValue(true)
    const container = await renderOverlay(true)
    expect(observers).toHaveLength(0)
    expect(container.querySelector('[data-hovered]')?.hasAttribute('data-flipped')).toBe(false)
  })
})
