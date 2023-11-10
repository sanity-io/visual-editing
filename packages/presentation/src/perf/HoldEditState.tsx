import { ReactNode } from 'react'
import { useEditState } from 'sanity'

export function HoldEditState(props: { id: string; type: string }): ReactNode {
  const { id, type } = props

  useEditState(id, type)

  return null
}
