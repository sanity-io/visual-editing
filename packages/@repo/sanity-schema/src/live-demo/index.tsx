import {definePlugin} from 'sanity'
import {structureTool} from 'sanity/structure'

export const liveDemoPlugin = definePlugin({
  name: '@repo/sanity-schema/live-demo',
  schema: {types: []},
  plugins: [structureTool()],
})
