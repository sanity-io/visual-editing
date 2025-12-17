import {defineConfig} from '@sanity/pkg-utils'

export default defineConfig({
  extract: {enabled: false, checkTypes: false},
  tsconfig: 'tsconfig.build.json',
  dts: 'rolldown',
})
