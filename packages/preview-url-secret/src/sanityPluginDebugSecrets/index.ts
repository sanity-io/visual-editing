import {definePlugin} from 'sanity'
import {schemaType} from '../constants'
import {debugUrlSecretsType} from './debugUrlSecrets'

export const debugSecrets = definePlugin<void>(() => {
  return {
    name: 'sanity-plugin-debug-secrets',
    schema: {
      types: [debugUrlSecretsType],
    },
    document: {
      actions: (prev, context) => {
        if (context.schemaType !== schemaType) {
          return prev
        }
        return prev.filter(({action}) => action === 'delete')
      },
      inspectors: (prev, context) => {
        if (context.documentType !== schemaType) {
          return prev
        }
        return []
      },
      unstable_fieldActions: (prev, context) => {
        if (context.schemaType.name !== schemaType) {
          return prev
        }
        return []
      },
    },
  }
})
