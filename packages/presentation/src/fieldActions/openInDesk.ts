import { MasterDetailIcon } from '@sanity/icons'
import { useContext } from 'react'
import { defineDocumentFieldAction } from 'sanity'
import { useDocumentPane } from 'sanity/desk'
import { useRouter } from 'sanity/router'

import { PresentationContext } from '../PresentationContext'

export const openInDesk = defineDocumentFieldAction({
  name: 'presentation/openInDesk',
  useAction() {
    const { documentId, documentType } = useDocumentPane()
    const { navigateIntent } = useRouter()
    const presentation = useContext(PresentationContext)

    return {
      type: 'action',
      hidden: !presentation,
      icon: MasterDetailIcon,
      title: 'Open in Desk',
      onAction() {
        navigateIntent('edit', {
          id: documentId,
          type: documentType,
          tool: 'desk',
        } as any)
      },
      renderAsButton: true,
    }
  },
})
