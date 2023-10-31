import { useRef } from 'react'
import { v4 as uuid } from 'uuid'

export function usePanelId(id?: string): string {
  const idRef = useRef(id || uuid())
  return idRef.current
}
