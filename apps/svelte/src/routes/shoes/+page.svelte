<script lang="ts">
  import ShoesListing from '../../components/Shoes.svelte'
  import type {PageProps} from './$types'

  const {data}: PageProps = $props()

  const {products} = $derived(data)
</script>

<ShoesListing {products} />
