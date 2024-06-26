import type {SanityDocument} from '@sanity/client'
import {lazy, Suspense, useEffect, useMemo} from 'react'
import {
  definePlugin,
  type InputProps,
  isDocumentSchemaType,
  type BaseFormNode,
  type ObjectSchemaType,
  type ObjectInputProps,
  pathToString,
} from 'sanity'

import {DEFAULT_TOOL_ICON, DEFAULT_TOOL_NAME, EDIT_INTENT_MODE} from './constants'
import {PresentationDocumentHeader} from './document/PresentationDocumentHeader'
import {PresentationDocumentProvider} from './document/PresentationDocumentProvider'
import {openInStructure} from './fieldActions/openInStructure'
import {getIntentState} from './getIntentState'
import {presentationUsEnglishLocaleBundle} from './i18n'
import {getPublishedId, useDocumentPane} from './internals'
import {router} from './router'
import type {
  DocumentLocationResolverObject,
  DocumentLocationsState,
  DocumentResolver,
  PresentationPluginOptions,
} from './types'

const PresentationTool = lazy(() => import('./PresentationTool'))
const BroadcastDisplayedDocument = lazy(() => import('./loader/BroadcastDisplayedDocument'))

/**
 * Define locations for a given document type.
 * This function doesn't do anything itself, it is used to provide type information.
 * @param resolver - resolver that return locations for a document.
 * @public
 */
export function defineLocations<K extends string>(
  resolver: DocumentLocationResolverObject<K> | DocumentLocationsState,
): typeof resolver {
  return resolver
}

/**
 * Define documents for a given location.
 * This function doesn't do anything itself, it is used to provide type information.
 * @param resolvers - resolvers that return documents.
 * @public
 */
export function defineDocuments(resolvers: DocumentResolver[]): typeof resolvers {
  return resolvers
}

export const presentationTool = definePlugin<PresentationPluginOptions>((options) => {
  const toolName = options.name || DEFAULT_TOOL_NAME

  if ('locate' in options) {
    // eslint-disable-next-line no-console
    console.warn('Presentation’s `locate` option is deprecated. Use `resolve.locations` instead.')
  }

  const hasLocationsResolver = !!(options.resolve?.locations || options.locate)

  function PresentationDocumentInput(input: InputProps) {
    const value = input.value as SanityDocument
    const documentId = value?._id ? getPublishedId(value?._id) : undefined
    const {focusPath} = useDocumentPane()

    if (isDocumentSchemaType(input.schemaType)) {
      const props = input as ObjectInputProps<ObjectSchemaType>

      // Create a fast index of the groups for all fields in the schema
      const fieldGroupIndex = useMemo(() => {
        const index = new Map<string, string>()
        props.schemaType.fields.forEach((field) => {
          index.set(field.name, field?.group?.[0] ?? 'all-fields')
        })
        return index
      }, [props.schemaType.fields])

      // Watch value of props.focusPath
      useEffect(() => {
        if (!focusPath || focusPath.length === 0) return
        const focusFieldPath = focusPath[0]
        const group = fieldGroupIndex.get(focusFieldPath?.toString()) ?? 'all-fields'
        if (group) {
          props.onFieldGroupSelect(group)
        }
      }, [focusPath])

      return (
        <PresentationDocumentProvider options={options}>
          {hasLocationsResolver && documentId && (
            <PresentationDocumentHeader
              documentId={documentId}
              options={options}
              schemaType={input.schemaType}
            />
          )}
          {input.renderDefault(props)}
          <Suspense key="broadcast-displayed-document">
            <BroadcastDisplayedDocument key={documentId} value={value} />
          </Suspense>
        </PresentationDocumentProvider>
      )
    }

    return input.renderDefault(input)
  }

  function canHandleCreateIntent(params: Record<string, unknown>) {
    // We can't handle create intents without a `type` parameter
    if (!('type' in params)) {
      return false
    }

    if ('presentation' in params && params['presentation'] !== toolName) {
      return false
    }

    return 'template' in params ? {template: true} : true
  }

  function canHandleEditIntent(params: Record<string, unknown>) {
    // We can't handle edit intents without `type` or `id` parameters
    if (!('type' in params) || !('id' in params)) {
      return false
    }

    if ('presentation' in params && params['presentation'] !== toolName) {
      return false
    }

    return 'mode' in params ? {mode: params['mode'] === EDIT_INTENT_MODE} : true
  }

  return {
    i18n: {
      bundles: [presentationUsEnglishLocaleBundle],
    },
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
          if (intent === 'create') return canHandleCreateIntent(params)
          if (intent === 'edit') return canHandleEditIntent(params)
          return false
        },
        getIntentState,
        router,
      },
    ],
  }
})
