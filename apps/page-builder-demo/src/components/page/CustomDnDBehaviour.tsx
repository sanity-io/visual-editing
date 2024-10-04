'use client'

import {useEffect} from 'react'

export default function () {
  useEffect(() => {}, [
    window.addEventListener('sanity/dragEnd', (e) => {
      e.preventDefault()
    }),
  ])
  return <></>
}
