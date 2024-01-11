import { ResetIcon } from '@sanity/icons'
import { TextInput, type TextInputClearButtonProps } from '@sanity/ui'
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
import { useActiveWorkspace } from 'sanity'

export const PreviewLocationInput: FunctionComponent<{
  fontSize?: number
  onChange: (value: string) => void
  origin: string
  padding?: number
  value: string
}> = function (props) {
  const { basePath = '/' } = useActiveWorkspace()?.activeWorkspace || {}
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
        // `origin` is an empty string '' if the Studio is embedded, and that's when we need to protect against recursion
        if (
          !origin &&
          (absoluteValue.startsWith(`${basePath}/`) ||
            absoluteValue === basePath)
        ) {
          setCustomValidity(
            `URL can't have the same base path as the Studio ${basePath}`,
          )
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
    [basePath, onChange, origin, sessionValue],
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
        value={sessionValue === undefined ? `${origin}${value}` : sessionValue}
      />
    </>
  )
}
