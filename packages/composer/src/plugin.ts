import { lazy } from 'react'
import { definePlugin } from 'sanity'

import { getIntentState } from './getIntentState'
import { router } from './router'
import { ComposerPluginOptions } from './types'

export const composerTool = definePlugin<ComposerPluginOptions>((options) => {
  return {
    tools: [
      {
        name: options.name || 'composer',
        component: lazy(() => import('./ComposerTool')),
        options,
        canHandleIntent(intent, params) {
          if (intent === 'focus' && params.id && params.path) {
            return true
          }
          return false
        },
        getIntentState,
        router,
      },
    ],

    document: {
      unstable_banners: (prev) => [...prev],
    },
  }
})
