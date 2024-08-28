import {FunctionComponent, PropsWithChildren, useCallback, useState} from 'react'
import {Button} from './Button'

export const MessageControls: FunctionComponent<
  PropsWithChildren<{
    onSend: (message: string) => void
  }>
> = (props) => {
  const {onSend, children} = props

  const [msgMessage, setMsgMessage] = useState('')

  const onClickSend = useCallback(() => {
    if (!msgMessage) return
    onSend(msgMessage)
  }, [msgMessage, onSend])

  return (
    <div className="flex-shrink-0 p-4">
      <div className="flex flex-col gap-2">
        <div className="flex gap-1">
          <div className="flex w-full items-center overflow-hidden rounded shadow">
            <input
              className="h-full flex-grow appearance-none rounded-r bg-gray-100 px-2 py-2 text-xs leading-tight text-gray-700 focus:outline-none"
              id="message"
              type="text"
              placeholder="message"
              value={msgMessage}
              onChange={(e) => setMsgMessage(e.target.value)}
            />
          </div>
          <Button onClick={onClickSend} disabled={!msgMessage}>
            &rarr;
          </Button>
        </div>
        {children}
      </div>
    </div>
  )
}
