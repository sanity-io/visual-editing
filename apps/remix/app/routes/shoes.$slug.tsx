import { type LoaderFunction, json } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'

export const loader: LoaderFunction = async ({ params }) => {
  console.log(params.slug)
  return json({ params, vercelEnv: process.env.VERCEL_ENV || 'development' })
}

export default function ShoePage() {
  const data = useLoaderData<typeof loader>()
  console.log(data.params.slug)

  const slug = data.params.slug
  const name = data.params.slug || 'Shoe'

  if (!slug) {
    throw new Error('No slug, 404?')
  }

  return (
    <div className="bg-white">
      <nav aria-label="Breadcrumb" className="py-4">
        <ol className="mx-auto flex max-w-2xl items-center space-x-2 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
          <li>
            <div className="flex items-center">
              <Link
                to="/shoes"
                className="mr-2 text-sm font-medium text-gray-900"
              >
                Shoes
              </Link>
              <svg
                width={16}
                height={20}
                viewBox="0 0 16 20"
                fill="currentColor"
                aria-hidden="true"
                className="h-5 w-4 text-gray-300"
              >
                <path d="M5.697 4.34L8.98 16.532h1.327L7.025 4.341H5.697z" />
              </svg>
            </div>
          </li>
          <li className="text-sm">
            <Link
              to={`/shoes/${slug}`}
              aria-current="page"
              className="font-medium text-gray-500 hover:text-gray-600"
            >
              {name}
            </Link>
          </li>
        </ol>
      </nav>

      <p className="text-center">TODO {data.params?.slug}</p>
      <span className="fixed bottom-1 left-1 block rounded bg-slate-900 px-2 py-1 text-xs text-slate-100">
        {data.vercelEnv}
      </span>
    </div>
  )
}
