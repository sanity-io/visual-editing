import { route } from 'sanity/router'

export const router = route.create('/', [
  route.intents('/intent'),
  route.create('/:type', [route.create('/:path')]),
])
