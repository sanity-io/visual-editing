'use client'

import {purgeSanity} from './actions'

export function Debug() {
  return (
    <button
      className="fixed right-0 top-0"
      onClick={() => {
        purgeSanity()
      }}
    >
      Refetch
    </button>
  )
}
