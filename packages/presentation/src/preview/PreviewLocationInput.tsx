import { LaunchIcon, ResetIcon } from '@sanity/icons'
import { Box, Button, TextInput, TextInputClearButtonProps } from '@sanity/ui'
import {
  ChangeEvent,
  FunctionComponent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

export const PreviewLocationInput: FunctionComponent<{
  fontSize?: number
  onChange: (value: string) => void
  origin: string
  padding?: number
  value: string
}> = function (props) {
  const { fontSize = 1, onChange, origin, padding = 3, value } = props
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [sessionValue, setSessionValue] = useState<string | undefined>(
    undefined,
  )
  const [customValidity, setCustomValidity] = useState<string | undefined>(
    undefined,
  )

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setSessionValue(event.currentTarget.value)
  }, [])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        if (sessionValue === undefined) {
          return
        }

        const absoluteValue =
          sessionValue.startsWith('/') || sessionValue === ''
            ? `${origin}${sessionValue}`
            : sessionValue

        if (
          !absoluteValue.startsWith(origin + '/') &&
          absoluteValue !== origin
        ) {
          setCustomValidity(`URL must start with ${origin}`)
          return
        }

        const nextValue =
          absoluteValue === origin ? origin + '/' : absoluteValue

        setCustomValidity(undefined)
        setSessionValue(undefined)

        onChange(nextValue.slice(origin.length))

        inputRef.current?.blur()
      }

      if (event.key === 'Escape') {
        setCustomValidity(undefined)
        setSessionValue(undefined)
      }
    },
    [onChange, origin, sessionValue],
  )

  const handleBlur = useCallback(() => {
    setCustomValidity(undefined)
    setSessionValue(undefined)
  }, [])

  useEffect(() => {
    setCustomValidity(undefined)
    setSessionValue(undefined)
  }, [origin, value])

  const resetButton: TextInputClearButtonProps = useMemo(
    () => ({ icon: ResetIcon }),
    [],
  )

  return (
    <>
      <TextInput
        clearButton={customValidity ? resetButton : undefined}
        customValidity={customValidity}
        fontSize={fontSize}
        onBlur={handleBlur}
        onClear={() => {
          setCustomValidity(undefined)
          setSessionValue(origin + value)
        }}
        onChange={handleChange}
        onKeyDownCapture={handleKeyDown}
        padding={padding}
        style={{ zIndex: 1 }}
        radius={2}
        ref={inputRef}
        space={padding}
        suffix={
          <Box padding={1} style={{ lineHeight: 0, zIndex: -1 }}>
            <Button
              as="a"
              fontSize={fontSize}
              href={origin + (sessionValue || value)}
              icon={LaunchIcon}
              padding={padding - 1}
              mode="bleed"
              rel="noreferrer"
              target="_blank"
            />
          </Box>
        }
        value={sessionValue === undefined ? `${origin}${value}` : sessionValue}
      />
    </>
  )
}
