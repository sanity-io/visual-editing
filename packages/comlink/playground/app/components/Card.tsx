import {FunctionComponent, PropsWithChildren, useEffect, useState} from 'react'

export const Card: FunctionComponent<
  PropsWithChildren<{
    status: string
    title: string
  }>
> = (props) => {
  const {title, status, children} = props

  const dotClasses = [
    'h-2 w-2 rounded-full',
    status.includes('connected')
      ? 'bg-green-500'
      : status === 'idle'
        ? 'bg-gray-500'
        : status === 'disconnected'
          ? 'bg-red-500'
          : 'bg-orange-500',
  ].join(' ')

  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div
      className={`h-full w-full transition-opacity ease-in ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="flex h-full w-full flex-col overflow-hidden rounded-lg border border-gray-300 bg-white bg-opacity-50 shadow-xl backdrop-blur-xl">
        <div className="flex flex-shrink-0 items-center justify-between bg-gray-200 px-4 py-2">
          <h1 className="text-sm font-medium">{title}</h1>
          <div className="flex items-center gap-2">
            <div className="text-xs">{status}</div>
            <div className={dotClasses}></div>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}
