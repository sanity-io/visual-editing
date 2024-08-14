import type {Meta, StoryObj} from '@storybook/react'
import {useMemo} from 'react'

import {Overlays} from '../ui/Overlays'
import {useChannel} from '../ui/useChannel'
import {MarketingPage as MarketingExample} from './examples/marketing/MarketingPage'
import {MediaArticlePage as MediaArticleExample} from './examples/media/MediaArticlePage'
import {MediaHomePage as MediaHomeExample} from './examples/media/MediaHomePage'

function Example(props: {example: React.ComponentType; inFrame: boolean; zIndex: number}) {
  const {example: Example, inFrame, zIndex} = props

  // Overlays will detect as being in an iframe when used in Storybook, so we override it
  const _channel = useChannel()
  const channel = useMemo(() => (_channel ? {..._channel, inFrame} : _channel), [_channel, inFrame])

  return (
    <>
      <Example />
      {channel && <Overlays channel={channel} zIndex={zIndex} />}
    </>
  )
}

const meta = {
  title: 'Overlays',
  component: Example,
  args: {
    zIndex: 5,
    inFrame: false,
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
