import { LockIcon } from '@sanity/icons'
import { defineType } from 'sanity'

export const debugUrlSecretsType = defineType({
  type: 'document',
  icon: LockIcon,
  name: 'sanity.previewUrlSecret',
  title: '@sanity/preview-url-secret',
  fields: [
    {
      type: 'string',
      name: 'secret',
      title: 'Secret',
    },
    {
      type: 'string',
      name: 'source',
      title: 'Source Tool',
    },
  ],
})
