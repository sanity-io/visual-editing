import { ContentSourceMap } from '@sanity/client/csm'
import { ClientPerspective } from 'next-sanity'
import dynamic from 'next/dynamic'
import { PropsWithChildren, Suspense } from 'react'
import { PostMessageQueries, PostMessageReporter } from './PostMessageQueries'

const Overlays = dynamic(() => import('./Overlays'))

export default function VisualEditing() {
  return (
    <>
      <Overlays />
      <PostMessageReporter />
      <ReportAllQueriesInUse />
    </>
  )
}

type CacheValue = {
  data: unknown
  sourceMap: ContentSourceMap | undefined
}
const pending = new Set<string>()
const fulfilled = new Map<string, CacheValue>()
export let onChange: () => void
type EndLoadQuery = (response: CacheValue) => void
export function startLoadQuery(
  projectId: string,
  dataset: string,
  perspective: ClientPerspective,
  query: string,
  params: any,
): EndLoadQuery {
  const id = JSON.stringify({
    projectId,
    dataset,
    perspective,
    query,
    params: params || {},
  })
  pending.add(id)
  return (response) => {
    fulfilled.set(id, response)
    onChange?.()
  }
}

type ReportQueriesProps = {
  stream: ReadableStream<string>
}

async function ReportQueries(props: ReportQueriesProps & PropsWithChildren) {
  const { stream } = props
  const reader = stream.getReader()

  console.log('Reading from stream')

  return (
    <Suspense>
      <RecursiveReportQueries reader={reader} />
      {props.children}
    </Suspense>
  )
}

type RecursiveReportQueriesProps = {
  reader: ReadableStreamDefaultReader<string>
}

async function RecursiveReportQueries({ reader }: RecursiveReportQueriesProps) {
  const { done, value } = await reader.read()

  if (done) {
    console.log('Stream is done')
    return null
  }

  const text =
    typeof value === 'string' ? value : new TextDecoder().decode(value)

  return (
    <>
      <Suspense>
        <RecursiveReportQueries reader={reader} />
      </Suspense>
      <Suspense>
        <PostMessageQueries payload={JSON.parse(text)} />
      </Suspense>
    </>
  )
}

function ReportAllQueriesInUse() {
  let timeout: NodeJS.Timeout
  const stream = new ReadableStream({
    start(controller) {
      let started = false

      onChange = () => {
        clearTimeout(timeout)
        if (!started && pending.size) {
          started = true
          // console.log('stream started', { pending, fulfilled })
        }
        if (!started) {
          return
        }

        let canClose = true
        for (const id of pending) {
          // console.log('stream pending', { id, pending, fulfilled })
          if (!fulfilled.has(id)) {
            canClose = false
          } else {
            const ready = fulfilled.get(id)!
            if (ready) {
              controller.enqueue(
                JSON.stringify({ ...JSON.parse(id), ...ready }),
              )
            }
            pending.delete(id)
            fulfilled.delete(id)
          }
        }

        if (canClose) {
          timeout = setTimeout(() => {
            console.log('Closing stream')
            onChange = () => {
              console.warn('Stream closed!')
            }
            controller.close()
          }, 3000)
        }
      }
      onChange()
    },
    pull(controller) {
      // We don't really need a pull in this example
    },
    cancel() {
      console.log('Stream cancel')
    },
  })

  return (
    <>
      <Suspense>
        <ReportQueries stream={stream} />
      </Suspense>
    </>
  )
}
