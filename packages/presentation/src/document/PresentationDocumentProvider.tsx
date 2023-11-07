import {
  ReactElement,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { PresentationPluginOptions } from '../types'
import { PresentationDocumentContext } from './PresentationDocumentContext'
import { PresentationDocumentContextValue } from './types'

/** @internal */
export function PresentationDocumentProvider(props: {
  children?: ReactNode
  options: PresentationPluginOptions
}): ReactElement {
  const { children, options } = props
  const parent = useContext(PresentationDocumentContext)
  const parentRegister = parent?.register

  const [optionsArray, setOptionsArray] = useState<PresentationPluginOptions[]>(
    () => [],
  )

  const register = useCallback(
    (options: PresentationPluginOptions) => {
      if (parentRegister) {
        return parentRegister(options)
      }

      setOptionsArray((prev) => [options].concat(prev))

      return () => {
        setOptionsArray((prev) => prev.filter((o) => o !== options))
      }
    },
    [parentRegister],
  )

  const registerRef = useRef(register)
  registerRef.current = register

  const context: PresentationDocumentContextValue = useMemo(
    () => ({
      options: parent?.options || optionsArray,
      register,
    }),
    [optionsArray, parent, register],
  )

  useEffect(() => registerRef.current(options), [options])

  return (
    <PresentationDocumentContext.Provider value={context}>
      {children}
    </PresentationDocumentContext.Provider>
  )
}
