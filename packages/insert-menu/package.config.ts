import baseConfig from '@repo/package.config'
import {defineConfig} from '@sanity/pkg-utils'

// https://github.com/sanity-io/pkg-utils#configuration
export default defineConfig({
  ...baseConfig,
  // the path to the tsconfig file for distributed builds
  tsconfig: 'tsconfig.dist.json',
})
