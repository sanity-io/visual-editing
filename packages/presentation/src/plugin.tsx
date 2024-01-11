import type { SanityDocument } from '@sanity/client'
import { lazy, Suspense } from 'react'
import {
  definePlugin,
  getPublishedId,
  InputProps,
  isDocumentSchemaType,
} from 'sanity'

import {
  DEFAULT_TOOL_ICON,
  DEFAULT_TOOL_NAME,
  EDIT_INTENT_MODE,
} from './constants'
import { PresentationDocumentHeader } from './document/PresentationDocumentHeader'
import { PresentationDocumentProvider } from './document/PresentationDocumentProvider'
import { openInStructure } from './fieldActions/openInStructure'
import { getIntentState } from './getIntentState'
import { router } from './router'
import { PresentationPluginOptions } from './types'

const PresentationTool = lazy(() => import('./PresentationTool'))
const BroadcastDisplayedDocument = lazy(
  () => import('./loader/BroadcastDisplayedDocument'),
)

export const presentationTool = definePlugin<PresentationPluginOptions>(
  (options) => {
    const toolName = options.name || DEFAULT_TOOL_NAME

    function PresentationDocumentInput(props: InputProps) {
      const value = props.value as SanityDocument
      const documentId = value?._id ? getPublishedId(value?._id) : undefined

      if (isDocumentSchemaType(props.schemaType)) {
        return (
          <PresentationDocumentProvider options={options}>
            {documentId && (
              <PresentationDocumentHeader
                documentId={documentId}
                options={options}
                schemaType={props.schemaType}
              />
            )}
            {props.renderDefault(props)}
            <Suspense key="broadcast-displayed-document">
              <BroadcastDisplayedDocument value={value} />
            </Suspense>
          </PresentationDocumentProvider>
        )
      }

      return props.renderDefault(props)
    }

    return {
      document: {
        unstable_fieldActions: (prev) => {
          return [
            ...prev.filter((a) => a.name !== openInStructure.name), // prevent duplication
            openInStructure,
          ]
        },
      },

      form: {
        components: {
          input: PresentationDocumentInput,
        },
      },

      tools: [
        {
          icon: options.icon || DEFAULT_TOOL_ICON,
          name: toolName,
          title: options.title,
          component: PresentationTool,
          options,
          canHandleIntent(intent, params) {
            if (intent === 'edit') {
              if (!params.id) return false

              if (params.presentation && params.presentation !== toolName) {
                return false
              }

              if (!params.mode) return true

              if (params.mode === EDIT_INTENT_MODE) {
                // inform the intent resolver that `mode` is matching
                return { mode: true }
              }
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
