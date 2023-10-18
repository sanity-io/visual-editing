import type {AppProps} from 'next/app'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

import '../tailwind.css'

const VisualEditing = dynamic(() => import('../components/VisualEditing'))

export default function App({
  Component,
  pageProps,
}: AppProps) {
  return <>
  <Component {...pageProps} />
  <Suspense><VisualEditing /></Suspense>
  </>
}
