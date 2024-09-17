'use client'

import {purgeEverything, purgeSanity} from './actions'

export default function Debug() {
  return (
    <>
      <button
        onClick={() => {
          purgeEverything()
        }}
      >
        Purge everything
      </button>
      <button
        onClick={() => {
          purgeSanity()
        }}
      >
        Purge sanity
      </button>
    </>
  )
}
