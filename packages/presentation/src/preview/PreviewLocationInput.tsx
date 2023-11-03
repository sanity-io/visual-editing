import { LaunchIcon } from '@sanity/icons'
import { Box, Button, Text, TextInput } from '@sanity/ui'
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
          <Box
            padding={2}
            style={{ lineHeight: 0, maxWidth: 140, whiteSpace: 'nowrap' }}
          >
            <Text size={1} textOverflow="ellipsis" title={host}>
              <a
                href={host}
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--card-muted-fg-color)' }}
              >
                {host}
              </a>
            </Text>
          </Box>
        )
      }
      radius={2}
      ref={inputRef}
      space={2}
      suffix={
        <Box style={{ lineHeight: 0 }}>
          <Button
            as="a"
            fontSize={1}
            href={host + sessionValue}
            icon={LaunchIcon}
            padding={2}
            mode="ghost"
            rel="noreferrer"
            target="_blank"
            style={{
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
            }}
          />
        </Box>
      }
      value={sessionValue}
    />
  )
}
