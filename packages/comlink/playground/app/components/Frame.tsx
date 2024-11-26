import {type Controller} from '@sanity/comlink'
import {FunctionComponent, useEffect, useRef} from 'react'

export const Frame: FunctionComponent<{
  controller: Controller
}> = (props) => {
  const {controller} = props
  const frameRef = useRef<HTMLIFrameElement | null>(null)

  useEffect(() => {
    const contentWindow = frameRef.current?.contentWindow
    if (!contentWindow) {
      return
    }
    const unsub = controller.addTarget(contentWindow)
    return () => {
      unsub()
    }
  }, [controller])

  return (
    <div className="min-h-[20rem] w-1/2 flex-shrink-0 flex-grow p-2">
      <iframe
        src="/frame"
        className="m-0 h-full w-full rounded-lg p-0"
        ref={frameRef}
        title={'frame'}
      />
    </div>
  )
}
