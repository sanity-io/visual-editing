import {ApiIcon, CheckmarkCircleIcon, CloseCircleIcon, LockIcon} from '@sanity/icons'
import {defineType} from 'sanity'
import {schemaIdSingleton, schemaType, SECRET_TTL} from '../constants'

export const debugUrlSecretsType = defineType({
  type: 'document',
  icon: LockIcon,
  name: schemaType,
  title: '@sanity/preview-url-secret',
  readOnly: true,
  fields: [
    {
      type: 'string',
      name: 'secret',
      title: 'Secret',
      hidden: ({document}) => document?._id === schemaIdSingleton,
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
      _id: '_id',
      source: 'source',
      studioUrl: 'studioUrl',
      updatedAt: '_updatedAt',
    },
    prepare(data) {
      if (data?._id === schemaIdSingleton) {
        return {
          title: '@sanity/preview-url-secret is setup correctly',
          subtitle: 'Never expires',
          media: ApiIcon,
        }
      }
      const url = data.studioUrl ? new URL(data.studioUrl, location.origin) : undefined
      const updatedAt = new Date(data.updatedAt).getTime()
      const expiresAt = new Date(updatedAt + 1000 * SECRET_TTL)
      const expired = expiresAt < new Date()
      const icon = expired ? CloseCircleIcon : CheckmarkCircleIcon
      return {
        title: url ? `${url.host}${url.pathname}` : data.source,
        subtitle: expired
          ? 'Expired'
          : `Expires in ${Math.round((expiresAt.getTime() - Date.now()) / (1000 * 60))} minutes`,
        media: icon,
      }
    },
  },
})
