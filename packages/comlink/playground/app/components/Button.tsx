import {FunctionComponent, PropsWithChildren} from 'react'

export const Button: FunctionComponent<
  PropsWithChildren<{
    disabled?: boolean
    onClick?: () => void
  }>
> = (props) => {
  const {onClick = () => {}, children, disabled} = props
  return (
    <button
      className="flex-grow rounded bg-gray-800 px-3 py-1.5 text-sm text-white shadow active:bg-gray-700 disabled:bg-gray-700 disabled:text-gray-500"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
