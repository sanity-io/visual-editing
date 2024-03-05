<script lang="ts">
  import { useQuery } from '@sanity/svelte-loader'
  import type { PageData } from './$types'
  import Shoes from '../../components/Shoes.svelte'

  export let data: PageData
  const { query, params, options } = data
  const q = useQuery(query, params, options)

  $: ({ data: products, loading } = $q)
</script>

<Shoes {products} {loading} />
