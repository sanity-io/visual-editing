import {type FunctionComponent, useEffect, useRef} from 'react'

import {useEditState} from './internals'
import type {PresentationNavigate} from './types'

/**
 * Renderless component to handle displaying the correct revision when the
 * perspective is switched. When the perspective changes to 'published', the
 * `rev` parameter correpsonding to the published document is resolved from the
 * published edit state. When the perspective changes to 'previewDrafts', the
 * `rev` parameter is removed, as the latest draft should be displayed.
 * @internal
 */
export const RevisionSwitcher: FunctionComponent<{
  documentId: string
  documentType: string
  navigate: PresentationNavigate
  perspective: 'previewDrafts' | 'published'
  revision: string | undefined
}> = function (props) {
  const {documentId, documentType, navigate, perspective, revision} = props

  const perspectiveRef = useRef<string | undefined>(undefined)
  const editState = useEditState(documentId, documentType)

  useEffect(() => {
    if (perspectiveRef.current !== perspective) {
      let rev = undefined
      if (perspective === 'published' && editState.published) {
        const {_updatedAt, _rev} = editState.published
        rev = `${_updatedAt}/${_rev}`
      }
      if (revision !== rev) {
        navigate({}, {rev}, true)
      }
    }

    perspectiveRef.current = perspective
  }, [documentId, editState, navigate, perspective, revision])

  return null
}
