<script lang="ts">
  import type { PageData } from './$types'
  import ShoesListing from '../../components/Shoes.svelte'

  export let data: PageData
  $: ({ products } = data)
</script>

<ShoesListing {products} />
