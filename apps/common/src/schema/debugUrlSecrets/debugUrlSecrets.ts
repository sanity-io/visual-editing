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
    {
      type: 'string',
      name: 'studioUrl',
      title: 'Studio URL',
    },
    {
      type: 'string',
      name: 'userId',
      title: 'Sanity User ID',
    },
  ],
  preview: {
    select: {
      title: 'source',
      subtitle: 'studioUrl',
    },
    prepare(data) {
      const url = data.subtitle
        ? new URL(data.subtitle, location.origin)
        : undefined
      return {
        ...data,
        subtitle: url ? `${url.host}${url.pathname}` : data.subtitle,
      }
    },
  },
})
