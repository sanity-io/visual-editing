import { ComposeIcon } from '@sanity/icons'
import { lazy } from 'react'
import { definePlugin, DocumentBanner } from 'sanity'

import { LocationsBanner } from './banners/locations'
import { MetaBanner } from './banners/meta'
import { getIntentState } from './getIntentState'
import { router } from './router'
import { PagesPluginOptions } from './types'

export const pagesTool = definePlugin<PagesPluginOptions>((options) => {
  const locationsBanner: DocumentBanner = {
    name: 'pages/locations',
    component: function LocationsBannerWithOptions(props) {
      return <LocationsBanner {...props} options={options} />
    },
  }

  const metaBanner: DocumentBanner = {
    name: 'pages/meta',
    component: function MetaBannerWithOptions(props) {
      return <MetaBanner {...props} options={options} />
    },
  }

  return {
    document: {
      unstable_comments: {
        enabled: true,
      },
      unstable_banners: (prev) => [
        ...prev.filter(
          (b) => b.name !== locationsBanner.name && b.name !== metaBanner.name,
        ),
        locationsBanner,
        metaBanner,
      ],
    },

    plugins: [],

    tools: [
      {
        icon: options.icon || ComposeIcon,
        name: options.name || 'pages',
        title: options.title,
        component: lazy(() => import('./PagesTool')),
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
