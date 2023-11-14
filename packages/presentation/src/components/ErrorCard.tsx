import {
  Box,
  Button,
  Card,
  CardProps,
  Container,
  Flex,
  Stack,
  Text,
} from '@sanity/ui'
import { ReactElement, ReactNode } from 'react'

export function ErrorCard(
  props: {
    children?: ReactNode
    message: string
    onRetry?: () => void
  } & CardProps,
): ReactElement {
  const { children, message, onRetry, ...restProps } = props

  return (
    <Card height="fill" {...restProps}>
      <Flex align="center" height="fill" justify="center">
        <Container padding={4} sizing="border" width={0}>
          <Stack space={4}>
            <Stack space={3}>
              <Text size={1} weight="semibold">
                An error occured
              </Text>
              <Text muted size={1}>
                {message}
              </Text>
            </Stack>

            {children}

            {onRetry && (
              <Box>
                <Button
                  fontSize={1}
                  mode="ghost"
                  onClick={onRetry}
                  text="Retry"
                />
              </Box>
            )}
          </Stack>
        </Container>
      </Flex>
    </Card>
  )
}
