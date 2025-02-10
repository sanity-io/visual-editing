import {Box, Button, Flex, Text} from '@sanity/ui'
import {useSelector} from '@xstate/react'
import {type FunctionComponent} from 'react'
import type {ActorRefFrom} from 'xstate'
import type {connectionMachine} from '../machines/connectionMachine'

export const Connection: FunctionComponent<{
  actor: ActorRefFrom<typeof connectionMachine>
  title: string
}> = (props) => {
  const {actor, title} = props
  const status = useSelector(actor, (state) => state?.context.status)

  return (
    <Button
      mode="bleed"
      tone={status === 'connected' ? 'positive' : 'critical'}
      padding={1}
      paddingRight={2}
      radius="full"
    >
      <Flex align="center" gap={0}>
        <Box flex="none" padding={1}>
          <Text size={1}>{title}</Text>
        </Box>
      </Flex>
    </Button>
  )
}
