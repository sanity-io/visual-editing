<script lang="ts">
  import {useQuery} from '@sanity/svelte-loader'
  import type {PageData} from './$types'
  import Shoe from '../../../components/Shoe.svelte'

  export let data: PageData
  const query = useQuery(data)
  $: ({data: product, loading} = $query)
</script>

<Shoe {product} {loading} slug={product.slug.current} />
