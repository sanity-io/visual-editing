import {HighlightIcon} from '@sanity/icons'
import {defineArrayMember, defineField} from 'sanity'

export const featureHighlightSectionType = defineArrayMember({
  type: 'object',
  name: 'featureHighlight',
  title: 'Feature Highlight',
  icon: HighlightIcon,
  fields: [
    defineField({
      type: 'string',
      name: 'headline',
      title: 'Headline',
    }),
    defineField({
      type: 'text',
      name: 'description',
      title: 'Description',
    }),
    defineField({
      type: 'image',
      name: 'image',
      title: 'Image',
    }),
    defineField({
      type: 'array',
      name: 'ctas',
      title: 'CTAs',
      of: [
        {
          type: 'object',
          name: 'cta',
          title: 'CTA',
          fields: [
            defineField({
              type: 'string',
              name: 'title',
              title: 'Title',
            }),
            defineField({
              type: 'string',
              name: 'href',
              title: 'Href',
            }),
          ],
        },
      ],
    }),
    defineField({
      type: 'reference',
      name: 'product',
      title: 'Product',
      to: [{type: 'product'}],
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
        subtitle: 'Feature',
      }
    },
  },
})
