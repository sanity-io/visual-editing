import { Stack } from '@sanity/ui'
import { ReactNode, useContext, useMemo } from 'react'
import { ObjectSchemaType, PublishedId, SANITY_VERSION } from 'sanity'

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

  // Meta banner is only displayed prior to 3.23.0
  const showMetaBanner = useMemo(() => {
    const [major, minor] = SANITY_VERSION.split('.').map(Number)
    return major <= 3 && minor <= 22
  }, [])

  if (context && context.options[0] !== options) {
    return null
  }

  const len = context?.options?.length || 0

  return (
    <Stack marginBottom={5} space={5}>
      {showMetaBanner && (
        <MetaBanner
          documentId={documentId}
          options={options}
          schemaType={schemaType}
        />
      )}

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
