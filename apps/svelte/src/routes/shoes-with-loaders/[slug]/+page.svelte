<script lang="ts">
  import {useQuery} from '@sanity/svelte-loader'
  import Shoe from '../../../components/Shoe.svelte'
  import type {PageData} from './$types'

  export let data: PageData
  const query = useQuery(data)
  $: ({data: product, loading} = $query)
</script>

<Shoe {product} {loading} slug={product.slug.current} />
