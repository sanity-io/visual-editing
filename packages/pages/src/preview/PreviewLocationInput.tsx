import { Box, Text, TextInput } from '@sanity/ui'
import {
  ChangeEvent,
  FunctionComponent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

export const PreviewLocationInput: FunctionComponent<{
  host?: string
  onChange: (value: string) => void
  value: string
}> = function (props) {
  const { host, onChange, value } = props
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
    <TextInput
      fontSize={1}
      onBlur={handleBlur}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      padding={2}
      prefix={
        host && (
          <Box padding={2}>
            <Text muted size={1}>
              {host}
            </Text>
          </Box>
        )
      }
      radius={2}
      ref={inputRef}
      value={sessionValue}
    />
  )
}
