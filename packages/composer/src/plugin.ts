import { lazy } from 'react'
import { definePlugin } from 'sanity'

import { ComposerPluginOptions } from './types'

export const composerTool = definePlugin<ComposerPluginOptions>((options) => {
  return {
    tools: [
      {
        name: options.name || 'composer',
        component: lazy(() => import('./ComposerTool')),
        options,
      },
    ],

    document: {
      unstable_banners: (prev) => [...prev],
    },
  }
})
