'use client'

import {useEffect, useState} from 'react'
import {flushSync} from 'react-dom'

export default function NextLiveTransitions(props: {
  children: React.ReactNode
  selector?: unknown
}) {
  const [[children, selector], setChildren] = useState(() => [props.children, props.selector])

  useEffect(() => {
    if (props.selector !== undefined) {
      console.log('we have a selector')
      // @ts-ignore
      if (props.selector === selector) {
        console.log('selector has not changed, skipping')
        return
      } else {
        console.log('selector has changed', props.selector, selector)
      }
    }
    if (props.children !== children) {
      console.log('children have changed', props.children, children)
      const transition = document.startViewTransition(() => {
        flushSync(() => setChildren([props.children, props.selector]))
      })
      console.log({transition})
      return () => {
        transition.skipTransition()
      }
    } else {
      console.log('children have not changed')
    }
  }, [children, props.children, props.selector, selector])

  return <>{children}</>
}
