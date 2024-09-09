import './tailwind.css'
import {withThemeByClassName} from '@storybook/addon-themes'
import type {Preview} from '@storybook/react'

const darkModeMq = window.matchMedia('(prefers-color-scheme: dark)')

export const decorators = [
  withThemeByClassName({
    themes: {
      light: 'light',
      dark: 'dark',
    },
    defaultTheme: darkModeMq.matches ? 'dark' : 'light',
  }),
]

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview
