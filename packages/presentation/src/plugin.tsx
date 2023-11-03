import { SanityDocument } from '@sanity/client'
import { ComposeIcon } from '@sanity/icons'
import { Stack } from '@sanity/ui'
import { lazy } from 'react'
import {
  definePlugin,
  getPublishedId,
  InputProps,
  isDocumentSchemaType,
} from 'sanity'

import { LocationsBanner } from './banners/locations'
import { MetaBanner } from './banners/meta'
import { getIntentState } from './getIntentState'
import { router } from './router'
import { PresentationPluginOptions } from './types'

export const presentationTool = definePlugin<PresentationPluginOptions>(
  (options) => {
    function PresentationDocumentInput(props: InputProps) {
      const value = props.value as SanityDocument
      const documentId = value?._id && getPublishedId(value?._id)

      if (documentId && isDocumentSchemaType(props.schemaType)) {
        return (
          <>
            <Stack marginBottom={5} space={5}>
              <MetaBanner
                documentId={documentId}
                options={options}
                schemaType={props.schemaType}
              />
              <LocationsBanner
                documentId={documentId}
                options={options}
                schemaType={props.schemaType}
              />
            </Stack>
            {props.renderDefault(props)}
          </>
        )
      }

      return props.renderDefault(props)
    }

    return {
      document: {
        unstable_comments: {
          enabled: true,
        },
      },

      form: {
        components: {
          input: PresentationDocumentInput,
        },
      },

      plugins: [],

      tools: [
        {
          icon: options.icon || ComposeIcon,
          name: options.name || 'presentation',
          title: options.title,
          component: lazy(() => import('./PresentationTool')),
          options,
          canHandleIntent(intent, params) {
            if (intent === 'edit' && params.id) {
              return true
            }
            return false
          },
          getIntentState,
          router,
        },
      ],
    }
  },
)
