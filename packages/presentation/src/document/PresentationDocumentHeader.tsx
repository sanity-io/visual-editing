import { Stack } from '@sanity/ui'
import { ReactNode, useContext } from 'react'
import { ObjectSchemaType, PublishedId } from 'sanity'

import { PresentationPluginOptions } from '../types'
import { LocationsBanner } from './LocationsBanner'
import { MetaBanner } from './MetaBanner'
import { PresentationDocumentContext } from './PresentationDocumentContext'

export function PresentationDocumentHeader(props: {
  documentId: PublishedId
  options: PresentationPluginOptions
  schemaType: ObjectSchemaType
}): ReactNode {
  const { documentId, options, schemaType } = props

  const context = useContext(PresentationDocumentContext)

  if (context && context.options[0] !== options) {
    return null
  }

  const len = context?.options?.length || 0

  return (
    <Stack marginBottom={5} space={5}>
      <MetaBanner
        documentId={documentId}
        options={options}
        schemaType={schemaType}
      />

      <Stack space={2}>
        {context?.options.map((o, idx) => (
          <LocationsBanner
            documentId={documentId}
            key={idx}
            options={o}
            schemaType={schemaType}
            showPresentationTitle={len > 1}
          />
        ))}
      </Stack>
    </Stack>
  )
}
