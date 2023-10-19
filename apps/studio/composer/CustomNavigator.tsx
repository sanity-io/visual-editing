import { useComposerNavigate, useComposerParams } from '@sanity/composer'
import { Card, Stack, Text } from '@sanity/ui'

export function CustomNavigator() {
  const navigate = useComposerNavigate()
  const { preview } = useComposerParams()

  return (
    <Card style={{ width: 300 }}>
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
      </Stack>
    </Card>
  )
}
