import {ExpandIcon} from '@sanity/icons'
import {Card, Flex, Hotkeys, Text} from '@sanity/ui/_visual-editing'
import type {FunctionComponent} from 'react'
import {styled} from 'styled-components'

const Root = styled(Card)`
  position: fixed;
  bottom: 2rem;
  left: 2rem;
`

export const OverlayMinimapPrompt: FunctionComponent = () => {
  return (
    <Root padding={2} shadow={2} radius={2} style={{zIndex: '999999'}}>
      <Flex align="center" gap={2}>
        <Hotkeys keys={['Shift']} />
        <Text size={1}>Zoom Out</Text>
        <ExpandIcon />
      </Flex>
    </Root>
  )
}
