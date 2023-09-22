import { lazy } from 'react'
import { definePlugin } from 'sanity'
import { route } from 'sanity/router'

// import { route } from 'sanity/router'
import { ComposerPluginOptions } from './types'

export const composerTool = definePlugin<ComposerPluginOptions>((options) => {
  return {
    tools: [
      {
        name: options.name || 'composer',
        component: lazy(() => import('./ComposerTool')),
        options,
        canHandleIntent(intent) {
          if (intent === 'focus') {
            return true
          }
          return false
        },
        getIntentState(intent, params, routerState, payload) {
          return { intent, params, payload }
        },
        router: route.create('/', [
          route.intents('/intent'),
          route.create('/:type', [route.create('/:path')]),
        ]),
      },
    ],

    document: {
      unstable_banners: (prev) => [...prev],
    },
  }
})
