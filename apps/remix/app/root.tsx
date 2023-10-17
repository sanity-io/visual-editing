import { json, type LinksFunction } from '@remix-run/node'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react'

import stylesheet from '~/tailwind.css'
import VisualEditing from './VisualEditing'

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: stylesheet },
]

export async function loader() {
  return json({ vercelEnv: process.env.VERCEL_ENV || 'development' })
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
        <VisualEditing />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
        <span className="fixed bottom-1 left-1 block rounded bg-slate-900 px-2 py-1 text-xs text-slate-100">
          {data.vercelEnv}
        </span>
      </body>
    </html>
  )
}
