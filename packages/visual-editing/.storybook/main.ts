import {createRequire} from 'node:module'
import {dirname, join} from 'node:path'

import type {StorybookConfig} from '@storybook/react-vite'

const require = createRequire(import.meta.url)

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): string {
  return dirname(require.resolve(join(value, 'package.json')))
}
const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [getAbsolutePath('@storybook/addon-themes'), getAbsolutePath('@storybook/addon-links')],
  framework: {
    name: getAbsolutePath('@storybook/react-vite'),
    options: {},
  },
  typescript: {
    // Not needed for this package, as we don't export internal components
    reactDocgen: false,
  },
}
export default config
