import {AddIcon, TrashIcon} from '@sanity/icons'
import {apiVersion} from '@sanity/preview-url-secret/constants'
import {
  disableVercelProtectionBypass,
  enableVercelProtectionBypass,
  subcribeToVercelProtectionBypass,
} from '@sanity/preview-url-secret/toggle-vercel-protection-bypass'
import {Box, Button, Card, Dialog, Heading, Stack, Text, TextInput, useToast} from '@sanity/ui'
import {useEffect, useReducer} from 'react'
import {useClient} from 'sanity'

interface State {
  status:
    | 'loading'
    | 'disabled'
    | 'add-secret-dialog'
    | 'adding-secret'
    | 'enabled'
    | 'removing-secret'
}
type Action =
  | {type: 'add-secret'}
  | {type: 'save-secret'}
  | {type: 'cancel-add-secret'}
  | {type: 'failed-add-secret'}
  | {type: 'saved-secret'}
  | {type: 'remove-secret'}
  | {type: 'failed-remove-secret'}
  | {type: 'removed-secret'}

function reducer(prevState: State, action: Action): State {
  switch (action.type) {
    case 'removed-secret':
      return {...prevState, status: 'disabled'}
    case 'remove-secret':
      return {...prevState, status: 'removing-secret'}
    case 'saved-secret':
      return {...prevState, status: 'enabled'}
    case 'save-secret':
      return {...prevState, status: 'adding-secret'}
    case 'cancel-add-secret':
      return {...prevState, status: 'disabled'}
    case 'add-secret':
      return {...prevState, status: 'add-secret-dialog'}
    case 'failed-remove-secret':
      return {...prevState, status: 'enabled'}
    case 'failed-add-secret':
      return {...prevState, status: 'add-secret-dialog'}
    default:
      return prevState
  }
}

export default function VercelProtectionBypassTool(): React.JSX.Element {
  const client = useClient({apiVersion: apiVersion})
  const {push: pushToast} = useToast()
  const [state, dispatch] = useReducer(reducer, {status: 'loading'})
  const adding = state.status === 'adding-secret'
  const removing = state.status === 'removing-secret'

  const handleEnable = (secret: string) => {
    dispatch({type: 'save-secret'})
    enableVercelProtectionBypass(client, secret)
      .then(() => {
        dispatch({type: 'saved-secret'})
        pushToast({
          status: 'success',
          title: 'Protection bypass is now enabled',
        })
      })
      .catch((reason) => {
        // eslint-disable-next-line no-console
        console.error(reason)
        pushToast({
          status: 'error',
          title:
            'There was an error when trying to enable protection bypass. See the browser console for more information.',
        })
        dispatch({type: 'failed-add-secret'})
      })
  }

  useEffect(() => {
    const unsubscribe = subcribeToVercelProtectionBypass(client, (secret) =>
      dispatch({type: secret ? 'saved-secret' : 'removed-secret'}),
    )
    return () => unsubscribe()
  }, [client])

  const enabled = state.status === 'enabled' || removing

  return (
    <>
      <Box
        sizing="border"
        display="flex"
        style={{
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <Stack gap={5}>
          <Card padding={4} style={{maxWidth: 640}}>
            <Stack gap={4} style={{justifyItems: 'flex-start', textWrap: 'pretty'}}>
              <Heading>Vercel Protection Bypass</Heading>
              {enabled ? (
                <>
                  <Box>
                    <Text style={{textWrap: 'pretty'}}>
                      Sanity Presentation is setup to use{' '}
                      <a
                        href="https://vercel.com/docs/security/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation"
                        target="_blank"
                        rel="noreferrer"
                      >
                        protection bypass for automation
                      </a>{' '}
                      in order to display protected deployments in its preview iframe for the
                      current Sanity dataset.
                    </Text>
                  </Box>
                  <Box>
                    <Text>
                      You can turn off automatic protection bypass at any time by clicking the
                      button below.
                    </Text>
                  </Box>
                  <Button
                    mode="ghost"
                    tone="critical"
                    icon={<TrashIcon />}
                    loading={removing}
                    onClick={() => {
                      dispatch({type: 'remove-secret'})
                      disableVercelProtectionBypass(client)
                        .then(() => {
                          pushToast({
                            status: 'warning',
                            title: 'Protection bypass is now disabled',
                          })
                          dispatch({type: 'removed-secret'})
                        })
                        .catch((reason) => {
                          // eslint-disable-next-line no-console
                          console.error(reason)
                          pushToast({
                            status: 'error',
                            title:
                              'There was an error when trying to disable protection bypass. See the browser console for more information.',
                          })
                          dispatch({type: 'failed-remove-secret'})
                        })
                    }}
                    text="Remove secret"
                  />
                  <Text>
                    Protection bypass remains enabled if this plugin is removed from your Sanity
                    config.
                  </Text>
                </>
              ) : (
                <>
                  <Box>
                    <Text style={{textWrap: 'pretty'}}>
                      Follow the instructions on{' '}
                      <a
                        href="https://vercel.com/docs/security/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation"
                        target="_blank"
                        rel="noreferrer"
                      >
                        how to enable protection bypass for automation
                      </a>
                      .
                    </Text>
                  </Box>
                  <Box>
                    <Text>
                      This will setup a secret that Vercel exposes as an environment variable called
                      VERCEL_AUTOMATION_BYPASS_SECRET, its value is the secret you need.
                    </Text>
                  </Box>
                  <Button
                    mode="ghost"
                    icon={<AddIcon />}
                    loading={state.status === 'loading'}
                    onClick={() => {
                      dispatch({type: 'add-secret'})
                    }}
                    text="Add secret"
                  />
                  <Text>
                    If you&apos;re using Sanity Presentation Tool with multiple protected
                    deployments ensure that they have the same secret set, as this tool will set a
                    secret that is shared in your dataset with all instances of Presentation Tool.
                  </Text>
                </>
              )}
            </Stack>
          </Card>
        </Stack>
      </Box>
      {(state.status === 'add-secret-dialog' || state.status === 'adding-secret') && (
        <Dialog
          animate
          id="add-secret-dialog"
          onClickOutside={() => dispatch({type: 'cancel-add-secret'})}
        >
          <Card padding={3}>
            <form
              onSubmit={(event) => {
                event.preventDefault()
                event.currentTarget.reportValidity()
                const formData = new FormData(event.currentTarget)
                const secret = formData.get('secret') as string
                if (secret) handleEnable(secret)
              }}
            >
              <Stack gap={3}>
                <Stack gap={2}>
                  <Text as="label" weight="semibold" size={1}>
                    Add bypass secret
                  </Text>
                  <Text muted size={1}>
                    {`Make sure it's the same secret the Vercel deployment is using that's loaded in the preview iframe.`}
                  </Text>
                  <TextInput
                    name="secret"
                    onFocus={(event) => {
                      event.currentTarget.setCustomValidity('')
                    }}
                    onBlur={(event) => {
                      event.currentTarget.setCustomValidity(
                        event.currentTarget.value.length == 32
                          ? ''
                          : 'Secret must be 32 characters long',
                      )
                      event.currentTarget.required = true
                    }}
                    minLength={32}
                    maxLength={32}
                    autoComplete="off"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck="false"
                    disabled={adding}
                  />
                </Stack>
                <Button
                  type="submit"
                  loading={adding}
                  text={adding ? 'Saving…' : 'Save'}
                  tone="positive"
                />
              </Stack>
            </form>
          </Card>
        </Dialog>
      )}
    </>
  )
}
