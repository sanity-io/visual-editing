import {FunctionComponent, PropsWithChildren, useState} from 'react'
import {RenderedMessage} from '../types'

export const MessageEntry: FunctionComponent<
  PropsWithChildren<{
    message: RenderedMessage
  }>
> = (props) => {
  const {message} = props

  const [expanded, setExpanded] = useState(false)
  return (
    <div className="flex flex-col gap-3 rounded bg-white bg-opacity-50 p-3 text-gray-800">
      <button
        className="flex w-full items-center justify-between gap-2 text-left text-xs"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex flex-col gap-1 leading-tight">
          <div className="font-medium">{message.type}</div>
          <div className="text-gray-500">{message.data?.message}</div>
        </div>
        <svg
          className="h-4 w-4 flex-shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {expanded ? <path d="m18 15-6-6-6 6" /> : <path d="m6 9 6 6 6-6" />}
        </svg>
      </button>
      {expanded && (
        <div className="w-full overflow-hidden rounded bg-gray-800 p-2 text-[11px] leading-normal text-white">
          <div className="overflow-x-auto">
            <pre className="font-light">{JSON.stringify(message, undefined, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  )
}
