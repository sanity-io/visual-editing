import {Flex, Text} from '@sanity/ui'
import type {FunctionComponent} from 'react'

export const StatusLine: FunctionComponent<{
  label: string
  value: string | number
}> = (props) => {
  const {label, value} = props

  return (
    <Flex align="center" justify="space-between" padding={3}>
      <Text weight={'medium'} size={1}>
        {label}
      </Text>
      <Text weight={'medium'} size={1} muted>
        {value}
      </Text>
    </Flex>
  )
}
