import {useEffect, useState, useSyncExternalStore} from 'react'
import {flushSync} from 'react-dom'

const noop = () => () => {}

/**
 * @public
 */
export function TransitionLayoutShift(props: {children: React.ReactNode}): React.JSX.Element {
  const isViewTransitionsSupported = useSyncExternalStore(
    noop,
    () => 'startViewTransition' in document,
    () => true,
  )
  const [children, setChildren] = useState(() => props.children)
  // const [transition, setTransition] = useState<ViewTransition | undefined>(undefined)

  // const transitionRef = useRef<ViewTransition | undefined>(undefined)
  // const trailingRef = useRef(false)
  // const willTransitionRef = useRef(false)
  // const transitionInProgress = Boolean(transition)
  useEffect(() => {
    if (!isViewTransitionsSupported || props.children === children) {
      return
    }
    // const controller = new AbortController()
    // const {signal} = controller

    // Check if using type is supported
    const isTypeSupported = CSS.supports('selector(html:active-view-transition-type(live))')
    const update = () => {
      flushSync(() => {
        setChildren(() => props.children)
      })
    }

    document.startViewTransition(
      isTypeSupported
        ? {
            // @ts-expect-error - this is fine, TSC types lag behind
            update,
            types: ['live'],
          }
        : update,
    )
    // startTransition(() => setTransition(transition))
    // transition.ready.then(() => {
    //   console.log('transition: ready, can run animation logic', {aborted: signal.aborted})
    // })
    // transition.updateCallbackDone.then(() => {
    //   console.log('transition: updateCallbackDone, dom is updated, call setTransition?', {
    //     aborted: signal.aborted,
    //   })
    //   // if (signal.aborted) return
    //   // startTransition(() => setTransition(transition))
    //   setTransition(transition)
    // })
    // transition.finished.then(() => {
    //   console.log('transition: finished, dom is updated, call setTransition?', {
    //     aborted: signal.aborted,
    //   })
    //   // if (signal.aborted) return
    //   // startTransition(() => setTransition(undefined))
    //   // transitionRef.current = undefined
    // })

    // return () => {
    //   timeoutRef.current = setTimeout(() => transition.skipTransition(), 100)
    // }
    return () => {
      // controller.abort()
      // transitionRef.current = undefined
    }
  }, [children, isViewTransitionsSupported, props.children])

  // if (transition) {
  //   console.log('transition: delaying render until finished', transition)
  //   // Delay render until the transition is finished
  //   use(transition.finished)
  // }

  if (!isViewTransitionsSupported) {
    return <>{props.children}</>
  }

  return <>{children}</>
}
