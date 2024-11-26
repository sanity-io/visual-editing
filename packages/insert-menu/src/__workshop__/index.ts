import {defineScope} from '@sanity/ui-workshop'
import {lazy} from 'react'

export default defineScope({
  name: 'insert-menu',
  title: 'Insert Menu',
  stories: [
    {
      name: 'InsertMenu',
      title: 'InsertMenu',
      component: lazy(() => import('./full')),
    },
  ],
})
