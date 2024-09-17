<script lang="ts">
  import {useQuery} from '@sanity/svelte-loader'
  import Shoes from '../../components/Shoes.svelte'
  import type {PageData} from './$types'

  export let data: PageData
  const query = useQuery(data)
  $: ({data: products, loading} = $query)
</script>

<Shoes {products} {loading} />
