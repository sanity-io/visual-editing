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
import { useActiveWorkspace } from 'sanity'

import { PresentationPluginOptions } from '../types'

export const PreviewLocationInput: FunctionComponent<{
  fontSize?: number
  onChange: (value: string) => void
  openPopup: (url: string) => void
  origin: string
  padding?: number
  value: string
  unstable_showUnsafeShareUrl: PresentationPluginOptions['unstable_showUnsafeShareUrl']
}> = function (props) {
  const { basePath = '/' } = useActiveWorkspace()?.activeWorkspace || {}
  const {
    fontSize = 1,
    onChange,
    openPopup,
    origin,
    padding = 3,
    value,
    unstable_showUnsafeShareUrl,
  } = props
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

  const handleOpenPopup = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      event.preventDefault()
      openPopup(event.currentTarget.href)
    },
    [openPopup],
  )

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
        suffix={
          unstable_showUnsafeShareUrl ? undefined : (
            <Box padding={1} style={{ lineHeight: 0, zIndex: -1 }}>
              <Button
                as="a"
                fontSize={fontSize}
                href={origin + (sessionValue || value)}
                icon={LaunchIcon}
                mode="bleed"
                onClick={handleOpenPopup as any}
                padding={padding - 1}
                rel="opener"
                target="_blank"
              />
            </Box>
          )
        }
        value={sessionValue === undefined ? `${origin}${value}` : sessionValue}
      />
    </>
  )
}
