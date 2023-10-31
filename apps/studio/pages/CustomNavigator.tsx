import { usePagesNavigate, usePagesParams } from '@sanity/pages'
import { Card, Stack, Text } from '@sanity/ui'

export function CustomNavigator() {
  const navigate = usePagesNavigate()
  const { preview } = usePagesParams()

  return (
    <Card>
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
