import { ComposeIcon } from '@sanity/icons'
import { lazy } from 'react'
import { definePlugin, DocumentBanner } from 'sanity'

import { LocationsBanner } from './banners/locations'
import { MetaBanner } from './banners/meta'
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

  const metaBanner: DocumentBanner = {
    name: 'composer/meta',
    component: function MetaBannerWithOptions(props) {
      return <MetaBanner {...props} options={options} />
    },
  }

  return {
    document: {
      unstable_banners: (prev) => [
        ...prev.filter(
          (b) => b.name !== locationsBanner.name && b.name !== metaBanner.name,
        ),
        locationsBanner,
        metaBanner,
      ],
    },

    tools: [
      {
        icon: options.icon || ComposeIcon,
        name: options.name || 'composer',
        title: options.title,
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
