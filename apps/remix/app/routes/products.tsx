import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

export async function loader() {
  return json({ vercelEnv: process.env.VERCEL_ENV || 'development' })
}

export default function ProductsRoute() {
  const data = useLoaderData<typeof loader>()

  return <p>{data.vercelEnv}</p>
}
