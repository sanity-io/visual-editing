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

  useEffect(() => {
    if (!isViewTransitionsSupported || props.children === children) {
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const transition = document.startViewTransition(() => {
      flushSync(() => setChildren(() => props.children))
    })
  }, [children, isViewTransitionsSupported, props.children])

  if (!isViewTransitionsSupported) {
    return <>{props.children}</>
  }

  return <>{children}</>
}
