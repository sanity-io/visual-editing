<script lang="ts">
  import {useQuery} from '@sanity/sveltekit'
  import Shoe from '../../../components/Shoe.svelte'
  import type {PageProps} from './$types'

  let {data}: PageProps = $props()

  const value = $derived(useQuery(data))
  const {data: product, loading} = $derived($value)
</script>

<div>
  <a href="./galaxy-runners">Galaxy Runners</a>
  <a href="./nike-pegasus-shield">Nike Pegasus Shield</a>
</div>

<Shoe {product} {loading} slug={product?.slug?.current} />
