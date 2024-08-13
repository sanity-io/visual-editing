import {BlockElementIcon} from '@sanity/icons'
import {defineArrayMember, defineField} from 'sanity'

import {PageSectionInput} from './components/PageSectionInput'
import {pageSectionType} from './pageSectionType'

export const pageSectionArrayMember = defineArrayMember({
  type: 'object',
  name: 'section',
  icon: BlockElementIcon,
  fields: [
    defineField({
      type: 'reference',
      name: 'symbol',
      title: 'Symbol',
      to: [{type: 'page.section'}],
    }),

    // overrides
    ...pageSectionType.fields,
  ],
  components: {
    input: PageSectionInput,
  },
})
