import type {AppProps} from 'next/app'
import dynamic from 'next/dynamic'
import '../tailwind.css'

const VisualEditing = dynamic(() => import('../components/VisualEditing'))

export interface SharedProps {
  draftMode: boolean
}

export default function App({Component, pageProps}: AppProps<SharedProps>) {
  const {draftMode} = pageProps
  return (
    <>
      <Component {...pageProps} />
      {draftMode && <VisualEditing />}
      <a
        href={draftMode ? '/api/draft-mode/disable' : undefined}
        title={draftMode ? 'Click to disable Draft Mode' : undefined}
        className="fixed bottom-1 left-1 block rounded bg-slate-900 px-2 py-1 text-xs text-slate-100"
      >
        pages-router:{' '}
        {draftMode ? 'draftMode' : process.env.NEXT_PUBLIC_VERCEL_ENV || 'development'}
      </a>
    </>
  )
}
