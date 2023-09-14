import { lazy } from 'react'
import { definePlugin } from 'sanity'

// import { route } from 'sanity/router'
import { ComposerPluginOptions } from './types'

export const composerTool = definePlugin<ComposerPluginOptions>((options) => {
  return {
    tools: [
      {
        name: options.name || 'composer',
        component: lazy(() => import('./ComposerTool')),
        options,

        // TODO: implement router
        // router: route.create( ... )
      },
    ],

    document: {
      unstable_banners: (prev) => [...prev],
    },
  }
})
