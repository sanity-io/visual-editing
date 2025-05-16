<script lang="ts">
  import {useQuery} from '@sanity/sveltekit'
  import Shoes from '../../components/Shoes.svelte'
  import type {PageProps} from './$types'

  const {data}: PageProps = $props()
  const value = $derived(useQuery(data))
  const {data: products, loading} = $derived($value)
</script>

<Shoes {products} {loading} />
