<script lang="ts">
  import { workspaces, studioUrl as baseUrl, apiVersion } from 'apps-common/env'
  import { createClient } from '@sanity/client'
  import { createQueryStore } from '@sanity/svelte-loader'
  import { shoesList } from 'apps-common/queries'

  const { projectId, dataset, workspace } = workspaces['svelte']
  const studioUrl = `${baseUrl}/${workspace}`

  const client = createClient({
    projectId,
    dataset,
    useCdn: false,
    apiVersion,
  })

  const { loadQuery, liveMode } = createQueryStore({
    client,
    allowStudioOrigin: studioUrl,
  })

  const shoe = loadQuery(shoesList)
</script>

<svelte:head>
  <title>Shoes</title>
</svelte:head>

<div>liveMode.connected {$liveMode.connected}</div>
<pre>{JSON.stringify(shoe)}</pre>
<div>loading: {$shoe.loading}</div>
<div>Data: {JSON.stringify($shoe.data)}</div>
