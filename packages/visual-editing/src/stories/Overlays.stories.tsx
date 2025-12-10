import type {Meta, StoryObj} from '@storybook/react'

import {startTransition, useEffect, useState} from 'react'
import {createPortal} from 'react-dom'

import {Overlays} from '../ui/Overlays'
import {useComlink} from '../ui/useComlink'
import {MarketingPage as MarketingExample} from './examples/marketing/MarketingPage'
import {MediaArticlePage as MediaArticleExample} from './examples/media/MediaArticlePage'
import {MediaHomePage as MediaHomeExample} from './examples/media/MediaHomePage'

function Example(props: {
  example: React.ComponentType
  inFrame: boolean
  inPopUp: boolean
  zIndex: number
}) {
  const {example: Example, inFrame, inPopUp, zIndex} = props

  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null)
  useEffect(() => {
    const node = document.createElement('sanity-visual-editing')
    document.documentElement.appendChild(node)
    startTransition(() => setPortalElement(node))
    return () => {
      startTransition(() => setPortalElement(null))
      if (document.documentElement.contains(node)) {
        document.documentElement.removeChild(node)
      }
    }
  }, [])

  const [comlink] = useComlink(inFrame === true || inPopUp === true)

  return (
    <>
      <Example />
      {portalElement &&
        createPortal(
          <Overlays
            comlink={comlink}
            inFrame={inFrame}
            inPopUp={inPopUp && !inFrame}
            zIndex={zIndex}
          />,
          portalElement,
        )}
    </>
  )
}

const meta = {
  title: 'Overlays',
  component: Example,
  args: {
    zIndex: 5,
    inFrame: false,
    inPopUp: false,
  },
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Example>

export default meta
type Story = StoryObj<typeof meta>

export const MarketingPage: Story = {
  args: {
    example: MarketingExample,
  },
}

export const MediaHomePage: Story = {
  args: {
    example: MediaHomeExample,
  },
}

export const MediaArticlePage: Story = {
  args: {
    example: MediaArticleExample,
  },
}
