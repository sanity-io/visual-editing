import { draftMode } from 'next/headers'
import VisualEditing from '@/components/VisualEditing'

export default function VisualEditingSlot(props: any) {
  console.log('VisualEditingSlot', props)
  return (
    <>
      {draftMode().isEnabled ? <VisualEditing /> : null}
      VisualEditingSlot
    </>
  )
}
