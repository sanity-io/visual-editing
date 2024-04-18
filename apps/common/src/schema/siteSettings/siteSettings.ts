import {ControlsIcon} from '@sanity/icons'
import {defineType} from 'sanity'

export const siteSettingsType = defineType({
  type: 'document',
  icon: ControlsIcon,
  name: 'siteSettings',
  title: 'Site Settings',
  fields: [
    {
      type: 'string',
      name: 'title',
      title: 'Site Title',
    },
    {
      type: 'string',
      name: 'description',
      title: 'Site Description',
    },
    {
      type: 'reference',
      name: 'frontPage',
      title: 'Front page',
      to: [{type: 'page'}],
    },
    {
      type: 'string',
      name: 'copyrightText',
      title: 'Copyright text',
    },
  ],
  preview: {
    prepare() {
      return {title: 'Site Settings'}
    },
  },
})
