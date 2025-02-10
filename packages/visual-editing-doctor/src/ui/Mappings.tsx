import {Button, Flex} from '@sanity/ui'
import {useSelector} from '@xstate/react'
import type {FunctionComponent} from 'react'
import {useDoctor} from './context/doctor/useDoctor'
import {StatusLine} from './StatusLine'

export const Mappings: FunctionComponent<{
  toggleIncorrectStegaAttributes: () => void
}> = (props) => {
  const {toggleIncorrectStegaAttributes} = props

  const doctor = useDoctor()
  const dataAttributeCount = useSelector(
    doctor.actorRef,
    (state) => state.context.dataAttributes.size,
  )
  const stegaNodeCount = useSelector(doctor.actorRef, (state) => state.context.stegaNodes.size)
  const incorrectStegaAttributeCount = useSelector(
    doctor.actorRef,
    (state) => state.context.incorrectStegaAttributes.length,
  )
  return (
    <Flex direction={'column'} flex={1} width={'100%'} padding={2}>
      <StatusLine label="Data Attributes" value={dataAttributeCount} />
      <StatusLine label="Stega Nodes" value={stegaNodeCount} />
      <Button padding={0} mode="ghost" onClick={toggleIncorrectStegaAttributes}>
        <StatusLine label="Incorrect Stega Insertions" value={incorrectStegaAttributeCount} />
      </Button>
    </Flex>
  )
}
