import {Box, Button, Card, Container, Flex, Inline, Stack, Text, type CardProps} from '@sanity/ui'
import type {ReactElement, ReactNode} from 'react'
import {useTranslation} from 'sanity'
import {presentationLocaleNamespace} from '../i18n'

export function ErrorCard(
  props: {
    children?: ReactNode
    message: string
    onRetry?: () => void
    onContinueAnyway?: () => void
  } & CardProps,
): ReactElement {
  const {children, message, onRetry, onContinueAnyway, ...restProps} = props

  const {t} = useTranslation(presentationLocaleNamespace)

  const retryButton = (
    <Button fontSize={1} mode="ghost" onClick={onRetry} text={t('error-card.retry-button.text')} />
  )
  const continueAnywayButton = (
    <Button
      fontSize={1}
      mode="ghost"
      tone="critical"
      onClick={onContinueAnyway}
      text={t('error-card.continue-button.text')}
    />
  )

  return (
    <Card height="fill" {...restProps}>
      <Flex align="center" height="fill" justify="center">
        <Container padding={4} sizing="border" width={0}>
          <Stack space={4}>
            <Stack space={3}>
              <Text size={1} weight="semibold">
                {t('error-card.title')}
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
