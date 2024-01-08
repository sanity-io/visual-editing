<script lang="ts">
  import { useQuery } from '@sanity/svelte-loader'
  import type { PageData } from './$types'
  import { shoe as shoeQuery, type ShoeResult } from 'apps-common/queries'

  export let data: PageData
  const { initial, params } = data;

  const query = useQuery<ShoeResult>(shoeQuery, params, { initial })

  $: ({ data: shoe, loading, encodeDataAttribute } = $query)

</script>

<div class="min-h-screen bg-white">
  <h1 data-sanity={encodeDataAttribute(['title'])}>{shoe.title}</h1>
</div>