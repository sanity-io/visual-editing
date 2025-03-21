import {Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData} from '@remix-run/react'
import {validateApiPerspective} from '@sanity/client'
import {json, type LinksFunction, type LoaderFunctionArgs} from '@vercel/remix'
import styles from '~/tailwind.css?url'
import {lazy, Suspense, useEffect, useMemo, useState, useSyncExternalStore} from 'react'
import {getPerspective, getSession} from './sessions'

const LiveVisualEditing = lazy(() => import('./LiveVisualEditing'))

export const links: LinksFunction = () => [{rel: 'stylesheet', href: styles}]

export async function loader({request}: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get('Cookie'))
  const previewMode = session.get('preview') === 'true'
  const perspective = getPerspective(session)
  return json({
    perspective,
    previewMode,
    vercelEnv: process.env.VERCEL_ENV || 'development',
    served: new Date().toJSON(),
  })
}

export default function App() {
  const data = useLoaderData<typeof loader>()

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        {data.previewMode && (
          <Suspense>
            <LiveVisualEditing perspective={data.perspective} />
          </Suspense>
        )}
        <ScrollRestoration />
        <Scripts />
        <span className="fixed bottom-1 left-1 block rounded bg-slate-900 px-2 py-1 text-xs text-slate-100">
          {data.vercelEnv}
          {', '}
          <span className="text-slate-300">
            served: <Timesince since={data.served} />
          </span>
        </span>
      </body>
    </html>
  )
}

const subscribe = () => () => {}
function Timesince(props: {since: string}) {
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
  const from = useMemo(() => new Date(props.since), [props.since])
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])
  if (!mounted) return 'now'
  return <span className="tabular-nums">{formatTimeSince(from, now)}</span>
}

const rtf = new Intl.RelativeTimeFormat('en', {style: 'short'})
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
  if (hours > -24) {
    return rtf.format(hours, 'hour')
  }
  const days = Math.ceil(hours / 24)
  return rtf.format(days, 'day')
}
