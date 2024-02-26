'use client'

import { useLiveMode } from '@sanity/react-loader'
import { VisualEditing } from 'next-sanity'
import { useEffect } from 'react'
import { client } from './sanity.client'

// Always enable stega in Live Mode
const stegaClient = client.withConfig({ stega: true })

export default function LiveVisualEditing(
  props: React.ComponentProps<typeof VisualEditing>,
) {
  useLiveMode({ client: stegaClient })
  useEffect(() => {
    if (
      process.env.NEXT_PUBLIC_VERCEL_ENV !== 'preview' &&
      window === parent &&
      !opener
    ) {
      // If not an iframe, turn off Draft Mode
      location.href = '/api/disable-draft'
    }
  }, [])

  return <VisualEditing {...props} />
}
