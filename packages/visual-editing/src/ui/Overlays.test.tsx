import {act, type ReactNode, Suspense} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import {afterAll, afterEach, beforeAll, describe, expect, test, vi} from 'vitest'

import {Overlays} from './Overlays'

const controllerRoots = vi.hoisted(() => [] as (HTMLElement | null)[])
vi.mock('./useController', () => ({
  useController: (rootElement: HTMLElement | null) => {
    controllerRoots.push(rootElement)
    return {current: null}
  },
}))

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

function createSuspender() {
  let suspended = false
  let resolve: (() => void) | undefined
  let promise: Promise<void> | undefined

  const Component = ({children}: {children: ReactNode}) => {
    if (suspended) throw promise
    return children
  }

  return {
    Component,
    suspend() {
      suspended = true
      promise = new Promise<void>((_resolve) => {
        resolve = _resolve
      })
    },
    resume() {
      suspended = false
      resolve?.()
    },
  }
}

describe('Overlays', () => {
  const mounted: {container: HTMLElement; root: Root}[] = []

  afterEach(async () => {
    await act(async () => {
      for (const {container, root} of mounted) {
        root.unmount()
        container.remove()
      }
    })
    mounted.length = 0
    controllerRoots.length = 0
  })

  test('can be hidden and revealed by Suspense', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    mounted.push({container, root})
    const suspender = createSuspender()

    const render = () =>
      root.render(
        <Suspense fallback={<div>Loading</div>}>
          <suspender.Component>
            <Overlays inFrame={false} inPopUp={false} />
          </suspender.Component>
        </Suspense>,
      )

    await act(render)
    expect(container.childElementCount).toBeGreaterThan(0)
    expect(container.textContent).not.toContain('Loading')
    expect(controllerRoots.at(-1)).toBeInstanceOf(HTMLElement)
    controllerRoots.length = 0

    suspender.suspend()
    await act(render)
    expect(container.textContent).toContain('Loading')

    await act(async () => {
      suspender.resume()
      render()
    })
    expect(container.childElementCount).toBeGreaterThan(0)
    expect(container.textContent).not.toContain('Loading')
    expect(controllerRoots).not.toContain(null)
  })
})
