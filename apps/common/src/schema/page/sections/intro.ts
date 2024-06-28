import {BlockContentIcon} from '@sanity/icons'
import {defineArrayMember, defineField} from 'sanity'

export const introSectionType = defineArrayMember({
  type: 'object',
  name: 'intro',
  title: 'Intro',
  icon: BlockContentIcon,
  fields: [
    defineField({
      type: 'string',
      name: 'headline',
      title: 'Headline',
    }),
    defineField({
      type: 'text',
      name: 'intro',
      title: 'Intro',
    }),
    defineField({
      type: 'sectionStyle',
      name: 'style',
      title: 'Style',
    }),
  ],
  preview: {
    select: {
      title: 'headline',
    },
    prepare(data) {
      return {
        ...data,
        subtitle: 'Intro',
      }
    },
  },
})
