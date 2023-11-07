import { Heading, Stack, Text } from '@sanity/ui'
import { ReactNode, useMemo } from 'react'
import {
  ObjectSchemaType,
  unstable_useValuePreview,
  useConnectionState,
  useEditState,
} from 'sanity'

import { PresentationPluginOptions } from '../types'

export function MetaBanner(props: {
  documentId: string
  // eslint-disable-next-line react/no-unused-prop-types
  options: PresentationPluginOptions
  schemaType: ObjectSchemaType
}): ReactNode {
  const { documentId, schemaType } = props
  const editState = useEditState(documentId, schemaType.name)
  const connectionState = useConnectionState(documentId, schemaType.name)
  const documentValue = editState.draft || editState.published
  const currentDocumentId = documentValue?._id || documentId

  // Subscribe document preview value
  const { error, value, isLoading } = unstable_useValuePreview({
    enabled: connectionState === 'connected',
    schemaType,
    value: useMemo(
      () => ({ _type: 'reference', _ref: currentDocumentId }),
      [currentDocumentId],
    ),
  })

  const typeTitle = schemaType.title || schemaType.name
  const previewTitle = value?.title

  if (error) {
    return null
  }

  if (isLoading) {
    return null
  }

  return (
    <Stack space={3}>
      {typeTitle !== previewTitle && (
        <Text muted size={1}>
          {typeTitle}
        </Text>
      )}
      <Heading as="h1" muted={!value?.title} size={3}>
        {value?.title || <em>Untitled</em>}
      </Heading>
    </Stack>
  )
}
