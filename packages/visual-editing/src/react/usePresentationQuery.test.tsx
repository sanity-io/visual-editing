import type {ClientPerspective} from '@sanity/client'
import type {Node} from '@sanity/comlink'
import type {LoaderControllerMsg, LoaderNodeMsg} from '@sanity/presentation-comlink'
import {act, useEffect} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import {afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi} from 'vitest'

import {
  setLoaderClientConfig,
  setLoaderComlink,
  setLoaderPerspective,
  setLoaderVariant,
} from '../ui/loader-comlink/context'
import {usePresentationQuery, type UsePresentationQueryReturns} from './usePresentationQuery'

type QueryChangeData = Extract<LoaderControllerMsg, {type: 'loader/query-change'}>['data']

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

function createFakeComlink() {
  const post = vi.fn()
  const queryChangeHandlers = new Set<(data: QueryChangeData) => void>()
  const node = {
    post,
    on: (type: string, handler: (data: QueryChangeData) => void) => {
      if (type !== 'loader/query-change') return () => {}
      queryChangeHandlers.add(handler)
      return () => queryChangeHandlers.delete(handler)
    },
  } as unknown as Node<LoaderNodeMsg, LoaderControllerMsg>
  return {
    node,
    queryChangeHandlers,
    listenCalls: () => post.mock.calls.filter(([type]) => type === 'loader/query-listen'),
    emitQueryChange: (data: QueryChangeData) => {
      for (const handler of queryChangeHandlers) handler(data)
    },
  }
}

function setPresentationState(perspective: ClientPerspective, variant: string | null = null) {
  setLoaderClientConfig('project-id', 'dataset')
  setLoaderPerspective(perspective)
  setLoaderVariant(variant)
}

const query = '*[_type == "page"][0]'

describe('usePresentationQuery', () => {
  let container: HTMLElement
  let root: Root
  let latest: UsePresentationQueryReturns<string> | undefined

  function Consumer(props: {params?: Record<string, unknown>}) {
    const result = usePresentationQuery({query, params: props.params, stega: false})
    useEffect(() => {
      latest = result
    }, [result])
    return null
  }

  async function render(params?: Record<string, unknown>) {
    await act(async () => root.render(<Consumer params={params} />))
  }

  beforeEach(() => {
    vi.useFakeTimers()
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    latest = undefined
  })

  afterEach(async () => {
    await act(async () => root.unmount())
    container.remove()
    setLoaderComlink(null)
    setLoaderClientConfig(null, null)
    setLoaderPerspective(null)
    setLoaderVariant(null)
    vi.useRealTimers()
  })

  test('registers the query as soon as project, dataset and perspective arrive after the comlink', async () => {
    const comlink = createFakeComlink()
    await render()

    // `LoaderComlink` publishes the node before the Presentation tool has sent `loader/perspective`
    await act(async () => setLoaderComlink(comlink.node))
    expect(comlink.listenCalls()).toHaveLength(0)

    await act(async () => setPresentationState('drafts'))

    expect(comlink.listenCalls()).toEqual([
      [
        'loader/query-listen',
        {
          projectId: 'project-id',
          dataset: 'dataset',
          perspective: 'drafts',
          variant: undefined,
          query,
          params: {},
          heartbeat: 20_000,
        },
      ],
    ])
  })

  test('keeps sending heartbeats on the interval without re-registering in between', async () => {
    const comlink = createFakeComlink()
    await act(async () => setLoaderComlink(comlink.node))
    await act(async () => setPresentationState('drafts'))
    await render()
    expect(comlink.listenCalls()).toHaveLength(1)

    await render()
    expect(comlink.listenCalls()).toHaveLength(1)

    await act(async () => vi.advanceTimersByTime(20_000))
    expect(comlink.listenCalls()).toHaveLength(2)
  })

  test('does not re-register when perspective and params change identity but not content', async () => {
    const comlink = createFakeComlink()
    await act(async () => setLoaderComlink(comlink.node))
    await act(async () => setPresentationState(['rABC', 'drafts']))
    await render({slug: 'home'})
    expect(comlink.listenCalls()).toHaveLength(1)

    await act(async () => setPresentationState(['rABC', 'drafts']))
    await render({slug: 'home'})
    expect(comlink.listenCalls()).toHaveLength(1)
  })

  test('re-registers immediately when perspective, variant or params change', async () => {
    const comlink = createFakeComlink()
    await act(async () => setLoaderComlink(comlink.node))
    await act(async () => setPresentationState('drafts'))
    await render({slug: 'home'})
    expect(comlink.listenCalls()).toHaveLength(1)

    await act(async () => setPresentationState('published'))
    expect(comlink.listenCalls().at(-1)?.[1]).toMatchObject({perspective: 'published'})

    await act(async () => setPresentationState('published', 'variant-a'))
    expect(comlink.listenCalls().at(-1)?.[1]).toMatchObject({variant: 'variant-a'})

    await render({slug: 'about'})
    expect(comlink.listenCalls().at(-1)?.[1]).toMatchObject({params: {slug: 'about'}})
    expect(comlink.listenCalls()).toHaveLength(4)
  })

  test('subscribes to query changes once per comlink', async () => {
    const comlink = createFakeComlink()
    await act(async () => setLoaderComlink(comlink.node))
    await render()
    await act(async () => setPresentationState('drafts'))
    await act(async () => setPresentationState('published'))

    expect(comlink.queryChangeHandlers.size).toBe(1)
  })

  test('ignores results for a perspective that is no longer active', async () => {
    const comlink = createFakeComlink()
    await act(async () => setLoaderComlink(comlink.node))
    await act(async () => setPresentationState('published'))
    await render()

    const result = {
      projectId: 'project-id',
      dataset: 'dataset',
      query,
      params: {},
      resultSourceMap: undefined,
      tags: undefined,
    }

    await act(async () =>
      comlink.emitQueryChange({...result, perspective: 'drafts', result: 'stale'}),
    )
    expect(latest?.data).toBeNull()

    await act(async () =>
      comlink.emitQueryChange({...result, perspective: 'published', result: 'fresh'}),
    )
    expect(latest).toMatchObject({data: 'fresh', perspective: 'published'})
  })
})
