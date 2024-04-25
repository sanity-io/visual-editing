'use client'

import {client, useLiveMode} from '@/sanity'
import {VisualEditing} from 'next-sanity'

export default function LiveVisualEditing() {
  useLiveMode({client})

  return <VisualEditing />
}
