import typography from '@tailwindcss/typography'
import type {Config} from 'tailwindcss'

export default {
  content: ['./app/**/*.{ts,tsx}', './sanity/**/*.{ts,tsx}'],
  theme: {
    extend: {
      backgroundColor: {
        'theme': 'var(--theme-background,#fff)',
        'theme-inverse': 'var(--theme-text,#fff)',
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
      },
      textColor: {
        'theme': 'var(--theme-text,#000)',
        'theme-inverse': 'var(--theme-background,#fff)',
      },
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [typography],
} satisfies Config
