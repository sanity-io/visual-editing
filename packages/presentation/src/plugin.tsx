import { SanityDocument } from '@sanity/client'
import { ComposeIcon } from '@sanity/icons'
import { lazy } from 'react'
import {
  definePlugin,
  getPublishedId,
  InputProps,
  isDocumentSchemaType,
} from 'sanity'

import { DEFAULT_TOOL_NAME } from './constants'
import { PresentationDocumentHeader } from './document/PresentationDocumentHeader'
import { PresentationDocumentProvider } from './document/PresentationDocumentProvider'
import { openInDesk } from './fieldActions/openInDesk'
import { getIntentState } from './getIntentState'
import { router } from './router'
import { PresentationPluginOptions } from './types'

export const presentationTool = definePlugin<PresentationPluginOptions>(
  (options) => {
    const toolName = options.name || DEFAULT_TOOL_NAME

    function PresentationDocumentInput(props: InputProps) {
      const value = props.value as SanityDocument
      const documentId = value?._id ? getPublishedId(value?._id) : undefined

      if (documentId && isDocumentSchemaType(props.schemaType)) {
        return (
          <PresentationDocumentProvider options={options}>
            <PresentationDocumentHeader
              documentId={documentId}
              options={options}
              schemaType={props.schemaType}
            />

            {props.renderDefault(props)}
          </PresentationDocumentProvider>
        )
      }

      return props.renderDefault(props)
    }

    return {
      document: {
        unstable_comments: {
          enabled: true,
        },

        // @TODO fix in https://linear.app/sanity/issue/ECO-253/declaring-open-in-desk-removes-all-field-actions
        /*
        unstable_fieldActions: (prev) => {
          console.log(prev)
          return [
            // prevent duplication
            ...prev.filter((a) => a.name !== openInDesk.name),
            openInDesk,
          ]
        },
        // */
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
          name: toolName,
          title: options.title,
          component: lazy(() => import('./PresentationTool')),
          options,
          canHandleIntent(intent, params) {
            if (params.tool && params.tool !== toolName) {
              return false
            }

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
