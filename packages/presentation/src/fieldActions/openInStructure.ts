import { MasterDetailIcon } from '@sanity/icons'
import { useContext } from 'react'
import {
  defineDocumentFieldAction,
  DocumentFieldActionItem,
  pathToString,
} from 'sanity'
import { useRouter } from 'sanity/router'

import { PresentationContext } from '../PresentationContext'

export const openInStructure = defineDocumentFieldAction({
  name: 'presentation/openInStructure',
  useAction({ documentId, documentType, path }) {
    const { navigateIntent } = useRouter()
    const presentation = useContext(PresentationContext)

    return {
      type: 'action',
      hidden: !presentation || path.length > 0,
      icon: MasterDetailIcon,
      title: 'Open in Structure',
      onAction() {
        navigateIntent('edit', {
          id: documentId,
          type: documentType,
          mode: 'structure',
          path: pathToString(path),
        } as any)
      },
      renderAsButton: true,
    } satisfies DocumentFieldActionItem
  },
})
