<script lang="ts">
  import Shoe from '../../../components/Shoe.svelte'
  import type {PageData} from './$types'

  export let data: PageData

  $: ({product, params} = data)
</script>

<Shoe {product} slug={params.slug} />
