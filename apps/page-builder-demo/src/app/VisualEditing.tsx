'use client'

import {useLiveMode} from '@/sanity'
import {VisualEditing} from 'next-sanity'

export default function LiveVisualEditing() {
  useLiveMode({})

  return <VisualEditing />
}
