import {lazy} from 'react'
import {definePlugin} from 'sanity'

const id = 'vercel-protection-bypass'

export interface VercelProtectionBypassConfig {
  name?: string
  title?: string
  icon?: React.ComponentType
}

export const vercelProtectionBypassTool = definePlugin<VercelProtectionBypassConfig | void>(
  (options) => {
    const {name, title, icon, ...config} = options || {}
    return {
      name: `@sanity/preview-url-secret/${id}`,
      tools: [
        {
          name: name || 'vercel-protection-bypass',
          title: title || 'Vercel Protection Bypass',
          icon: icon,
          component: lazy(() => import('./VercelProtectionBypassTool')),
          options: config,
          __internalApplicationType: `sanity/${id}`,
        },
      ],
    }
  },
)
