<script lang="ts">
  import ShoesListing from '../../components/Shoes.svelte'
  import type {PageData} from './$types'

  export let data: PageData
  $: ({products} = data)
</script>

<ShoesListing {products} />
