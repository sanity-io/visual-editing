import { rem, Stack } from '@sanity/ui'
import { type ReactNode, useContext } from 'react'
import { type ObjectSchemaType, type PublishedId } from 'sanity'
import styled from 'styled-components'

import type { PresentationPluginOptions } from '../types'
import { LocationsBanner } from './LocationsBanner'
import { PresentationDocumentContext } from './PresentationDocumentContext'

const LocationStack = styled(Stack)`
  min-height: ${rem(42)};

  & + &:empty {
    display: none;
  }
`

export function PresentationDocumentHeader(props: {
  documentId: PublishedId
  options: PresentationPluginOptions
  schemaType: ObjectSchemaType
}): ReactNode {
  const { documentId, options, schemaType } = props

  const context = useContext(PresentationDocumentContext)

  if (context && context.options[0] !== options) {
    return <LocationStack marginBottom={5} space={5} />
  }

  const len = context?.options?.length || 0

  return (
    <LocationStack marginBottom={5} space={5}>
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
    </LocationStack>
  )
}
