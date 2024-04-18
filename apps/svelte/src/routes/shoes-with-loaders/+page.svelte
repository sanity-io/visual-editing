<script lang="ts">
  import {useQuery} from '@sanity/svelte-loader'
  import type {PageData} from './$types'
  import Shoes from '../../components/Shoes.svelte'

  export let data: PageData
  const query = useQuery(data)
  $: ({data: products, loading} = $query)
</script>

<Shoes {products} {loading} />
