import {Flex} from '@sanity/ui'
import {useSelector} from '@xstate/react'
import {type FunctionComponent} from 'react'
import {useDoctor} from './context/doctor/useDoctor'
import {StatusLine} from './StatusLine'

export const Overview: FunctionComponent = () => {
  const doctor = useDoctor()

  const element = useSelector(doctor.actorRef, (state) => state.context.visualEditingElement)
  const connectionCount = useSelector(doctor.actorRef, (state) => state.context.connections.size)
  const stegaCount = useSelector(doctor.actorRef, (state) => state.context.stegaNodes.size)

  return (
    <Flex direction={'column'} padding={2} flex={1} width={'100%'}>
      <StatusLine label="Visual Editing Component" value={element ? 'Mounted' : 'Not Found'} />
      <StatusLine label="Stega Encoding" value={stegaCount ? 'Detected' : 'Not Found'} />
      <StatusLine label="Active Connections" value={connectionCount} />
    </Flex>
  )
}
