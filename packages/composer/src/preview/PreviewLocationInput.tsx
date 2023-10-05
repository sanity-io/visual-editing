import { TextInput } from '@sanity/ui'
import {
  ChangeEvent,
  FunctionComponent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import styled from 'styled-components'

const StyledTextInput = styled(TextInput)`
  font-family: ${({ theme }) => theme.sanity.fonts.code.family};
`

export const PreviewLocationInput: FunctionComponent<{
  onChange: (value: string) => void
  value: string
}> = function (props) {
  const { onChange, value } = props
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [sessionValue, setSessionValue] = useState(value)

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setSessionValue(event.currentTarget.value)
  }, [])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        onChange(sessionValue)
        inputRef.current?.blur()
      }
    },
    [onChange, sessionValue],
  )

  const handleBlur = useCallback(() => {
    setSessionValue(value)
  }, [value])

  useEffect(() => {
    setSessionValue(value)
  }, [value])

  return (
    <StyledTextInput
      border={false}
      fontSize={1}
      onBlur={handleBlur}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      padding={2}
      radius={2}
      ref={inputRef}
      value={sessionValue}
    />
  )
}
