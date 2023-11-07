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
  fontSize?: number
  host?: string
  onChange: (value: string) => void
  padding?: number
  value: string
}> = function (props) {
  const { fontSize = 1, host, onChange, padding = 3, value } = props
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
      fontSize={fontSize}
      onBlur={handleBlur}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      padding={padding}
      style={{ zIndex: 1 }}
      prefix={
        host && (
          <Box
            padding={padding}
            style={{ lineHeight: 0, maxWidth: 180, whiteSpace: 'nowrap' }}
          >
            <Text size={fontSize} textOverflow="ellipsis" title={host}>
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
      space={padding}
      suffix={
        <Box style={{ lineHeight: 0, zIndex: -1 }}>
          <Button
            as="a"
            fontSize={fontSize}
            href={(host || '') + (sessionValue || '')}
            icon={LaunchIcon}
            padding={padding}
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
