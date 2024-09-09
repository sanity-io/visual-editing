import * as serverOnly from '@sanity/react-loader'
import {client} from './sanity.client'

const token = process.env.SANITY_API_READ_TOKEN

if (!token) {
  throw new Error('Missing SANITY_API_READ_TOKEN')
}

const {loadQuery, setServerClient} = serverOnly
setServerClient(
  client.withConfig({
    token,
    // Enable stega if it's a Vercel preview deployment, as the Vercel Toolbar has controls that shows overlays
    stega: process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview',
  }),
)

// Exports to be used by getInitialProps, getServerSideProps, getStaticProps
export {loadQuery}
