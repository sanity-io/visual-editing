import { type LoaderFunction, json } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'

export const loader: LoaderFunction = async ({ params }) => {
  console.log(params.slug)
  return json({ params, vercelEnv: process.env.VERCEL_ENV || 'development' })
}

export default function ShoePage() {
  const data = useLoaderData<typeof loader>()
  console.log(data.params.slug)
  return (
    <div className="bg-white">
      <Link
        className="fixed left-1 top-1 inline-block rounded bg-slate-100 px-2 py-1 text-xs text-slate-900 hover:bg-slate-200"
        to="/shoes"
      >
        Go back
      </Link>
      <p className="text-center">TODO {data.params?.slug}</p>
      <span className="fixed bottom-1 left-1 block rounded bg-slate-900 px-2 py-1 text-xs text-slate-100">
        {data.vercelEnv}
      </span>
    </div>
  )
}
