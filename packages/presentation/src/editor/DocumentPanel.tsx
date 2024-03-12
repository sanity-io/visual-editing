import { studioPath } from '@sanity/client/csm'
import {
  type ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react'
import type { Path } from 'sanity'
import { StructureToolProvider } from 'sanity/structure'

import type { DeskDocumentPaneParams } from '../types'
import { DocumentPane } from './DocumentPane'

export function DocumentPanel(props: {
  deskParams: DeskDocumentPaneParams
  documentId: string
  documentType: string
  onDeskParams: (params: DeskDocumentPaneParams) => void
  onFocusPath: (path: Path) => void
  imperativeFocusPath: string
}): ReactElement {
  const {
    deskParams,
    documentId,
    documentType,
    onDeskParams,
    onFocusPath,
    imperativeFocusPath,
  } = props

  const [handledFocusPath, setHandledFocusPath] = useState(false)
  const params = useMemo(
    () => ({
      ...deskParams,
      path: handledFocusPath ? '' : imperativeFocusPath,
    }),
    [deskParams, handledFocusPath, imperativeFocusPath],
  )

  useEffect(() => {
    if (imperativeFocusPath) {
      const timeout = window.setTimeout(() => {
        setHandledFocusPath(false)
      })
      return () => clearTimeout(timeout)
    }
    return
  }, [imperativeFocusPath])

  const timeoutRef = useRef<number>(0)
  const handleOnFocusPath = useCallback<typeof onFocusPath>(
    (path) => {
      console.log('handlePath', path)
      onFocusPath(path)
      clearTimeout(timeoutRef.current)
      timeoutRef.current = window.setTimeout(() => {
        setHandledFocusPath(true)
      }, 50)
    },
    [onFocusPath],
  )

  console.log('render path', params.path)
  useEffect(() => {
    console.log('useEffect path', params.path)
  }, [params.path])

  return (
    <StructureToolProvider>
      <DocumentPane
        documentId={documentId}
        documentType={documentType}
        params={params}
        onDeskParams={onDeskParams}
        onFocusPath={handleOnFocusPath}
      />
    </StructureToolProvider>
  )
}
