import {rem, Stack} from '@sanity/ui'
import {type ReactNode, useContext} from 'react'
import {type ObjectSchemaType, type PublishedId} from 'sanity'
import {styled} from 'styled-components'

import type {PresentationPluginOptions} from '../types'
import {useDocumentLocations} from '../useDocumentLocations'
import {LocationsBanner} from './LocationsBanner'
import {PresentationDocumentContext} from './PresentationDocumentContext'

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
  const {documentId, options, schemaType} = props

  const context = useContext(PresentationDocumentContext)

  const {state, status} = useDocumentLocations({
    id: documentId,
    resolvers: options.resolve?.locations || options.locate,
    type: schemaType.name,
  })

  // @todo is this necessary?
  // if (context && context.options[0] !== options) {
  //   return <LocationStack marginBottom={5} space={5} />
  // }

  if (status === 'empty') return null

  return (
    <LocationStack marginBottom={5} space={5}>
      <Stack space={2}>
        {context?.options.map((options, idx) => (
          <LocationsBanner
            documentId={documentId}
            isResolving={status === 'resolving'}
            key={idx}
            options={options}
            schemaType={schemaType}
            showPresentationTitle={context?.options?.length > 1}
            state={state}
          />
        ))}
      </Stack>
    </LocationStack>
  )
}
