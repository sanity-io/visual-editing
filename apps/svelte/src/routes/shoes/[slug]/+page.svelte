<script lang="ts">
  import type { PageData } from './$types'
  import Shoe from '../../../components/Shoe.svelte'

  export let data: PageData

  $: ({ product, params } = data)
</script>

<Shoe {product} slug={params.slug} />
