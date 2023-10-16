import { ComposeIcon } from '@sanity/icons'
import { lazy } from 'react'
import { definePlugin, DocumentBanner } from 'sanity'

import { LocationsBanner } from './banners/locations'
import { getIntentState } from './getIntentState'
import { router } from './router'
import { ComposerPluginOptions } from './types'

export const composerTool = definePlugin<ComposerPluginOptions>((options) => {
  const locationsBanner: DocumentBanner = {
    name: 'composer/locations',
    component: function LocationsBannerWithOptions(props) {
      return <LocationsBanner {...props} options={options} />
    },
  }

  return {
    document: {
      unstable_banners: (prev) => [
        ...prev.filter((b) => b.name !== locationsBanner.name),
        locationsBanner,
      ],
    },

    tools: [
      {
        name: options.name || 'composer',
        icon: options.icon || ComposeIcon,
        component: lazy(() => import('./ComposerTool')),
        options,
        canHandleIntent(intent, params) {
          if (intent === 'edit' && params.id) {
            return true
          }
          return false
        },
        getIntentState,
        router,
      },
    ],
  }
})
