import type {Node} from '@sanity/comlink'
import type {LoaderControllerMsg, LoaderNodeMsg} from '@sanity/presentation-comlink'
import {act, useEffect, useState, type ReactNode} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import {afterAll, afterEach, beforeAll, describe, expect, test, vi} from 'vitest'

import {
  setLoaderClientConfig,
  setLoaderComlink,
  setLoaderPerspective,
  setLoaderVariant,
} from '../ui/loader-comlink/context'
import {usePresentationQuery, type UsePresentationQueryReturns} from './usePresentationQuery'

const QUERY = '*[_id == $id]{_id, title}'
const HEARTBEAT = 20_000

type QueryChangeData = Extract<LoaderControllerMsg, {type: 'loader/query-change'}>['data']
type LoaderNode = Node<LoaderNodeMsg, LoaderControllerMsg>

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

function createComlink() {
  let queryChange: ((data: QueryChangeData) => void) | undefined
  const post = vi.fn()
  const on = vi.fn((type: string, handler: (data: QueryChangeData) => void) => {
    if (type === 'loader/query-change') queryChange = handler
    return () => {
      if (queryChange === handler) queryChange = undefined
    }
  })
  return {
    node: {post, on} as unknown as LoaderNode,
    post,
    emitQueryChange: (data: QueryChangeData) => {
      if (!queryChange) throw new Error('query-change listener was not registered')
      queryChange(data)
    },
  }
}

describe('usePresentationQuery', () => {
  const mounted: {container: HTMLElement; root: Root}[] = []
  let latest: UsePresentationQueryReturns<string> | undefined

  afterEach(async () => {
    await act(async () => {
      for (const {container, root} of mounted) {
        root.unmount()
        container.remove()
      }
    })
    mounted.length = 0
    latest = undefined
    setLoaderComlink(null)
    setLoaderClientConfig(null, null)
    setLoaderPerspective(null)
    setLoaderVariant(null)
    vi.restoreAllMocks()
  })

  async function render(ui: ReactNode) {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    mounted.push({container, root})
    await act(async () => {
      root.render(ui)
    })
    return {container, root}
  }

  function Harness({
    query = QUERY,
    params,
  }: {
    query?: string
    params?: Record<string, unknown> | Promise<Record<string, unknown>>
  }) {
    const result = usePresentationQuery({query, params})
    useEffect(() => {
      latest = result
    })
    return null
  }

  async function connect(
    node: LoaderNode,
    options?: {perspective?: 'drafts' | 'published'; variant?: string | null},
  ) {
    await act(async () => {
      setLoaderComlink(node)
    })
    await act(async () => {
      setLoaderClientConfig('hiomol4a', 'production')
    })
    await act(async () => {
      setLoaderPerspective(options?.perspective ?? 'drafts')
      setLoaderVariant(options?.variant ?? null)
    })
  }

  test('does not listen until project, dataset, and perspective are available', async () => {
    const {node, post} = createComlink()
    const setIntervalSpy = vi.spyOn(globalThis, 'setInterval')
    await render(<Harness params={{id: '1'}} />)

    await act(async () => {
      setLoaderComlink(node)
    })
    expect(post).not.toHaveBeenCalled()
    expect(setIntervalSpy).not.toHaveBeenCalled()

    await act(async () => {
      setLoaderClientConfig('hiomol4a', 'production')
    })
    expect(post).not.toHaveBeenCalled()

    await act(async () => {
      setLoaderPerspective('drafts')
    })

    expect(post).toHaveBeenCalledTimes(1)
    expect(post).toHaveBeenCalledWith('loader/query-listen', {
      projectId: 'hiomol4a',
      dataset: 'production',
      perspective: 'drafts',
      variant: undefined,
      query: QUERY,
      params: {id: '1'},
      heartbeat: HEARTBEAT,
    })
    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), HEARTBEAT)
  })

  test('re-listens immediately when perspective or variant changes', async () => {
    const {node, post} = createComlink()
    const setIntervalSpy = vi.spyOn(globalThis, 'setInterval')
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval')
    await render(<Harness />)
    await connect(node)

    post.mockClear()
    clearIntervalSpy.mockClear()
    const intervalsBefore = setIntervalSpy.mock.calls.length

    await act(async () => {
      setLoaderPerspective('published')
    })

    expect(clearIntervalSpy).toHaveBeenCalled()
    expect(setIntervalSpy.mock.calls.length).toBe(intervalsBefore + 1)
    expect(post).toHaveBeenCalledTimes(1)
    expect(post).toHaveBeenLastCalledWith(
      'loader/query-listen',
      expect.objectContaining({perspective: 'published', variant: undefined}),
    )

    post.mockClear()
    await act(async () => {
      setLoaderVariant('summer')
    })

    expect(post).toHaveBeenCalledTimes(1)
    expect(post).toHaveBeenLastCalledWith(
      'loader/query-listen',
      expect.objectContaining({perspective: 'published', variant: 'summer'}),
    )
  })

  test('re-listens when query or param contents change, not when param identity changes', async () => {
    const {node, post} = createComlink()
    const {root} = await render(<Harness params={{id: '1'}} />)
    await connect(node)
    expect(post).toHaveBeenCalledTimes(1)

    await act(async () => {
      root.render(<Harness params={{id: '1'}} />)
    })
    expect(post).toHaveBeenCalledTimes(1)

    await act(async () => {
      root.render(<Harness params={{id: '2'}} />)
    })
    expect(post).toHaveBeenCalledTimes(2)
    expect(post).toHaveBeenLastCalledWith(
      'loader/query-listen',
      expect.objectContaining({params: {id: '2'}}),
    )

    await act(async () => {
      root.render(<Harness query='*[_type == "page"]' params={{id: '2'}} />)
    })
    expect(post).toHaveBeenCalledTimes(3)
    expect(post).toHaveBeenLastCalledWith(
      'loader/query-listen',
      expect.objectContaining({query: '*[_type == "page"]', params: {id: '2'}}),
    )
  })

  test('heartbeat publishes the latest thenable without restarting on a new promise', async () => {
    const {node, post} = createComlink()
    const setIntervalSpy = vi.spyOn(globalThis, 'setInterval')
    let params = Promise.resolve({id: '1'})

    function LatestParams() {
      usePresentationQuery({query: QUERY, params})
      return null
    }

    const {root} = await render(<LatestParams />)
    await connect(node)
    expect(post).toHaveBeenCalledTimes(1)
    const heartbeat = setIntervalSpy.mock.calls.find((call) => call[1] === HEARTBEAT)?.[0] as
      | (() => void)
      | undefined
    if (!heartbeat) throw new Error('expected a query listen heartbeat')

    const nextParams = Promise.resolve({id: '2'})
    params = nextParams
    await act(async () => {
      root.render(<LatestParams />)
    })
    expect(post).toHaveBeenCalledTimes(1)

    post.mockClear()
    heartbeat()
    expect(post).toHaveBeenCalledTimes(1)
    expect(post.mock.calls[0]?.[1]).toMatchObject({params: nextParams})
  })

  test('a promise created during render does not retrigger the listener', async () => {
    const {node, post} = createComlink()
    let renders = 0

    function InlinePromise() {
      usePresentationQuery({query: '*', params: Promise.resolve({id: '1'})})
      useEffect(() => {
        renders += 1
      })
      return null
    }

    function Wrapper() {
      const [tick, setTick] = useState(0)
      return (
        <button onClick={() => setTick((value) => value + 1)} type="button">
          {tick}
          <InlinePromise />
        </button>
      )
    }

    const {container} = await render(<Wrapper />)
    await connect(node)
    const postsAfterConnect = post.mock.calls.length
    const rendersAfterConnect = renders

    const button = container.querySelector('button')
    if (!(button instanceof HTMLButtonElement)) throw new Error('missing button')
    await act(async () => {
      button.click()
    })

    expect(renders - rendersAfterConnect).toBe(1)
    expect(post.mock.calls.length).toBe(postsAfterConnect)
    expect(renders).toBeLessThan(8)
  })

  test('applies query results that match the active query', async () => {
    const {node, post, emitQueryChange} = createComlink()
    await render(<Harness params={{id: '1'}} />)
    await connect(node)
    expect(post).toHaveBeenCalled()

    await act(async () => {
      emitQueryChange({
        projectId: 'other',
        dataset: 'production',
        perspective: 'drafts',
        query: QUERY,
        params: {id: '1'},
        result: {title: 'Ignored'},
      })
    })
    expect(latest?.data).toBeNull()

    await act(async () => {
      emitQueryChange({
        projectId: 'hiomol4a',
        dataset: 'production',
        perspective: 'drafts',
        query: QUERY,
        params: {id: '1'},
        result: {title: 'Hello'},
      })
    })
    expect(latest?.data).toEqual({title: 'Hello'})
    expect(latest?.perspective).toBe('drafts')
  })
})
