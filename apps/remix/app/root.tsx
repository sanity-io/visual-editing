import {Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData} from '@remix-run/react'
import {json, type LinksFunction} from '@vercel/remix'
import styles from '~/tailwind.css?url'
import {formatTimeSince} from 'apps-common/utils'
import {lazy, Suspense, useEffect, useMemo, useState, useSyncExternalStore} from 'react'

const LiveVisualEditing = lazy(() => import('./LiveVisualEditing'))

export const links: LinksFunction = () => [{rel: 'stylesheet', href: styles}]

export async function loader() {
  // Simulate a slightly slow API
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return json({
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
        <Suspense>
          <LiveVisualEditing />
        </Suspense>
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
