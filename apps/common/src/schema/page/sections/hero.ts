import {ImageIcon} from '@sanity/icons'
import {defineArrayMember, defineField} from 'sanity'

export const heroSectionType = defineArrayMember({
  type: 'object',
  name: 'hero',
  title: 'Hero',
  icon: ImageIcon,
  description: 'The hero section of the page',
  fields: [
    defineField({
      type: 'string',
      name: 'headline',
      title: 'Headline',
    }),
    defineField({
      type: 'string',
      name: 'tagline',
      title: 'Tagline',
    }),
    defineField({
      type: 'string',
      name: 'subline',
      title: 'Subline',
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
        subtitle: 'Hero',
      }
    },
  },
})
