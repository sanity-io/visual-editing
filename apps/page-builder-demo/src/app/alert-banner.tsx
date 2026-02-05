'use client'

import {useVisualEditingEnvironment} from '@sanity/visual-editing/react'
import {useRouter} from 'next/navigation'
import {useTransition} from 'react'

import {disableDraftMode} from './actions'

export default function AlertBanner() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const env = useVisualEditingEnvironment()
  const shouldShow = env !== null && env !== 'presentation-iframe'

  if (!shouldShow) return null

  return (
    <div
      className={`${
        pending ? 'animate-pulse' : ''
      } sticky left-0 top-0 z-50 w-full border-b bg-white/95 text-black backdrop-blur`}
    >
      <div className="py-2 text-center text-sm">
        {pending ? (
          'Disabling draft mode...'
        ) : (
          <>
            {'Previewing drafts. '}
            <button
              type="button"
              onClick={() =>
                startTransition(() =>
                  disableDraftMode().then(() => {
                    router.refresh()
                  }),
                )
              }
              className="hover:text-cyan underline transition-colors duration-200"
            >
              Back to published
            </button>
          </>
        )}
      </div>
    </div>
  )
}
