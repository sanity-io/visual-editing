import type { AppProps } from 'next/app'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

import '../tailwind.css'

const VisualEditing = dynamic(() => import('../components/VisualEditing'))

export interface SharedProps {
  draftMode: boolean
}

export default function App({ Component, pageProps }: AppProps<SharedProps>) {
  const { draftMode } = pageProps
  return (
    <>
      <Component {...pageProps} />
      {draftMode && (
        <Suspense>
          <VisualEditing />
        </Suspense>
      )}
    </>
  )
}
