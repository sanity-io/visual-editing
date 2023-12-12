import {
  Box,
  Button,
  Card,
  CardProps,
  Container,
  Flex,
  Inline,
  Stack,
  Text,
} from '@sanity/ui'
import { ReactElement, ReactNode } from 'react'

export function ErrorCard(
  props: {
    children?: ReactNode
    message: string
    onRetry?: () => void
    onContinueAnyway?: () => void
  } & CardProps,
): ReactElement {
  const { children, message, onRetry, onContinueAnyway, ...restProps } = props

  const retryButton = (
    <Button fontSize={1} mode="ghost" onClick={onRetry} text="Retry" />
  )
  const continueAnywayButton = (
    <Button
      fontSize={1}
      mode="ghost"
      tone="critical"
      onClick={onContinueAnyway}
      text="Continue anyway"
    />
  )

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

            {onRetry && onContinueAnyway ? (
              <Inline space={2}>
                {retryButton}
                {continueAnywayButton}
              </Inline>
            ) : onRetry ? (
              <Box>{retryButton}</Box>
            ) : onContinueAnyway ? (
              <Box>{continueAnywayButton}</Box>
            ) : null}
          </Stack>
        </Container>
      </Flex>
    </Card>
  )
}
