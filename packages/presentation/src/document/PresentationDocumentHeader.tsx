import {rem, Stack} from '@sanity/ui'
import {type ReactNode, useContext} from 'react'
import {type ObjectSchemaType, type PublishedId} from 'sanity'
import {styled} from 'styled-components'

import type {PresentationPluginOptions} from '../types'
import {useDocumentLocations} from '../useDocumentLocations'
import {usePresentationTool} from '../usePresentationTool'
import {LocationsBanner} from './LocationsBanner'
import {PresentationDocumentContext} from './PresentationDocumentContext'

const LocationStack = styled(Stack)`
  min-height: ${rem(42)};

  & + &:empty {
    display: none;
  }
`

function useCurrentPresentationToolName(): string | undefined {
  try {
    return usePresentationTool().name
  } catch {
    return undefined
  }
}

export function PresentationDocumentHeader(props: {
  documentId: PublishedId
  options: PresentationPluginOptions
  schemaType: ObjectSchemaType
}): ReactNode {
  const {documentId, options, schemaType} = props

  const context = useContext(PresentationDocumentContext)
  const presentationToolName = useCurrentPresentationToolName()
  const {state, status} = useDocumentLocations({
    id: documentId,
    resolvers: options.resolve?.locations || options.locate,
    type: schemaType.name,
  })

  if ((context && context.options[0] !== options) || status === 'empty') {
    return null
  }

  // If we are in the context of a Presentation tool, filter out the options
  // that are not relevant to the current tool instance
  const relevantOptions = (context?.options || []).filter(({name}) =>
    presentationToolName ? name === presentationToolName : true,
  )

  return (
    <LocationStack marginBottom={5} space={5}>
      <Stack space={2}>
        {relevantOptions.map((options, idx) => (
          <LocationsBanner
            documentId={documentId}
            isResolving={status === 'resolving'}
            key={idx}
            options={options}
            schemaType={schemaType}
            showPresentationTitle={relevantOptions.length > 1}
            state={state}
          />
        ))}
      </Stack>
    </LocationStack>
  )
}
