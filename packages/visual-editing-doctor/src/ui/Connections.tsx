import {isMaybePreviewIframe, isMaybePreviewWindow} from '@sanity/presentation-comlink'
import {Box, Flex, Text} from '@sanity/ui'
import {useSelector} from '@xstate/react'
import {type FunctionComponent} from 'react'
import {Connection} from './Connection'
import {useDoctor} from './context/doctor/useDoctor'

const titleMap: Record<string, string> = {
  'overlays': 'Visual Editing',
  'loaders': 'Loaders',
  'preview-kit': 'Preview Kit',
}

export const Connections: FunctionComponent = () => {
  const doctor = useDoctor()

  const inFrame = isMaybePreviewIframe()
  const inPopUp = isMaybePreviewWindow()

  const connections = useSelector(doctor.actorRef, (state) =>
    Array.from(state.context.connections)
      .map(([, actor]) => {
        const title = titleMap[actor.id]
        return {id: actor.id, actor, title}
      })
      .sort((a, b) => (a.title || '').localeCompare(b.title || '')),
  )

  const isMaybePreview = inFrame || inPopUp

  return (
    <Flex flex={1} direction={'column'} justify={'center'} align={'center'}>
      {isMaybePreview ? (
        <Flex gap={2}>
          {connections.map(({id, actor, title}) => (
            <Connection key={id} title={title} actor={actor} />
          ))}
        </Flex>
      ) : (
        <Box padding={4}>
          <Text align={'center'}>
            Application not running in a preview context, cannot establish connections.
          </Text>
        </Box>
      )}
    </Flex>
  )
}
