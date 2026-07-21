import {Outlet, createBrowserRouter, RouterProvider} from 'react-router'

import {AppLayout} from '@/components/AppLayout'
import {LiveVisualEditing} from '@/components/LiveVisualEditing'
import {PreviewStatus} from '@/components/PreviewStatus'
import {FrontPage} from '@/routes/FrontPage'
import {ProductPage} from '@/routes/ProductPage'
import {ProductsPage} from '@/routes/ProductsPage'
import {SlugPage} from '@/routes/SlugPage'
import type {LayoutQueryResult} from '@/sanity.types'
import {useQuery} from '@/sanity/loader'
import {previewParams} from '@/sanity/previewParams'
import {layoutQuery} from '@/sanity/queries'

function Root() {
  const {data, perspective, variant} = useQuery<LayoutQueryResult>(layoutQuery)

  return (
    <>
      <AppLayout data={data ?? null}>
        <Outlet />
      </AppLayout>
      {/* Standalone previews fetch with the URL params but the default (non-live)
          fetcher doesn't report them on the query state, so fall back to them here */}
      <PreviewStatus
        perspective={perspective ?? previewParams?.perspective}
        variant={variant ?? previewParams?.variant}
      />
      <LiveVisualEditing />
    </>
  )
}

const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      {path: '/', element: <FrontPage />},
      {path: '/pages/:slug', element: <SlugPage />},
      {path: '/products', element: <ProductsPage />},
      {path: '/product/:slug', element: <ProductPage />},
    ],
  },
])

export function App() {
  return <RouterProvider router={router} />
}
