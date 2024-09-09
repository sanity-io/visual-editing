import {AddIcon, BulbOutlineIcon, DocumentIcon, SchemaIcon} from '@sanity/icons'
import {usePresentationNavigate, usePresentationParams} from '@sanity/presentation'
import {Box, Button, Card, Flex, Menu, MenuButton, MenuItem, Stack, Text} from '@sanity/ui'
import {useIntentLink} from 'sanity/router'

export function CustomNavigator() {
  const navigate = usePresentationNavigate()
  const params = usePresentationParams()
  const {preview} = params

  return (
    <Card flex={1} height="fill">
      <Flex height="fill" direction="column" justify="space-between" flex={1}>
        <Stack padding={2} space={1}>
          <Card
            as="button"
            onClick={() => navigate('/')}
            padding={3}
            pressed={preview === '/'}
            radius={2}
          >
            <Text>Home</Text>
          </Card>
          <Card
            as="button"
            onClick={() => navigate('/projects')}
            padding={3}
            pressed={preview === '/projects'}
            radius={2}
          >
            <Text>Projects</Text>
          </Card>
          <Card
            as="button"
            onClick={() => navigate('/products')}
            padding={3}
            pressed={preview === '/products'}
            radius={2}
          >
            <Text>Products</Text>
          </Card>
          <Card
            as="button"
            onClick={() =>
              navigate('/product/highline', {
                type: 'product',
                id: '807cc05c-8c4c-443a-a9c1-198fd3fd7b16',
              })
            }
            padding={3}
            pressed={preview === '/product/highline'}
            radius={2}
          >
            <Stack space={2}>
              <Text size={0} muted>
                Product
              </Text>
              <Text>Highline</Text>
            </Stack>
          </Card>
        </Stack>
        <Stack padding={2} space={1}>
          <MenuButton
            button={<Button icon={AddIcon} text="New Document" mode="ghost" />}
            id="create-menu-button"
            placement="top-start"
            menu={
              <Menu>
                <MenuItem
                  {...useIntentLink({
                    intent: 'create',
                    params: [
                      {
                        type: 'page',
                        mode: 'presentation',
                        preview: params.preview,
                        template: 'page-basic',
                      },
                      {
                        title: 'Basic Page',
                      },
                    ],
                  })}
                  as="a"
                >
                  <Flex align="center" gap={3}>
                    <Box flex="none">
                      <Text size={1}>
                        <DocumentIcon />
                      </Text>
                    </Box>
                    <Stack flex={1} space={2}>
                      <Text size={1} weight="medium">
                        Page (Basic)
                      </Text>
                      <Text muted size={1}>
                        Create a new page document
                      </Text>
                    </Stack>
                  </Flex>
                </MenuItem>
                <MenuItem
                  {...useIntentLink({
                    intent: 'create',
                    params: {
                      type: 'project',
                      mode: 'presentation',
                      preview: params.preview,
                    },
                  })}
                  as="a"
                >
                  <Flex align="center" gap={3}>
                    <Box flex="none">
                      <Text size={1}>
                        <SchemaIcon />
                      </Text>
                    </Box>
                    <Stack flex={1} space={2}>
                      <Text size={1} weight="medium">
                        Project
                      </Text>
                      <Text muted size={1}>
                        Create a new project document
                      </Text>
                    </Stack>
                  </Flex>
                </MenuItem>
                <MenuItem
                  {...useIntentLink({
                    intent: 'create',
                    params: {
                      type: 'product',
                      mode: 'presentation',
                      preview: params.preview,
                    },
                  })}
                  as="a"
                >
                  <Flex align="center" gap={3}>
                    <Box flex="none">
                      <Text size={1}>
                        <BulbOutlineIcon />
                      </Text>
                    </Box>
                    <Stack flex={1} space={2}>
                      <Text size={1} weight="medium">
                        Product
                      </Text>
                      <Text muted size={1}>
                        Create a new product document
                      </Text>
                    </Stack>
                  </Flex>
                </MenuItem>
              </Menu>
            }
            popover={{portal: true}}
          />
        </Stack>
      </Flex>
    </Card>
  )
}
