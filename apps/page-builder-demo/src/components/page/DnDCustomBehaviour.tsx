'use client'

import {useEffect} from 'react'

export function DnDCustomBehaviour() {
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      console.log(e.detail)
    }

    window.addEventListener('sanity/dragEnd', handler as EventListener)

    return () => {
      window.removeEventListener('sanity/dragEnd', handler as EventListener)
    }
  }, [])

  return <></>
}
