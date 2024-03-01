<script lang="ts">
  import { useQuery } from '@sanity/svelte-loader'
  import type { PageData } from './$types'
  import Shoe from '../../../components/Shoe.svelte'

  export let data: PageData
  const { query, params, options } = data
  const q = useQuery(query, params, options)
  $: ({ data: product, loading } = $q)
</script>

<Shoe {product} {loading} slug={params.slug} />
