<script lang="ts">
  import Shoes from '../../components/Shoes.svelte'
  import type {PageProps} from './$types'

  const {data}: PageProps = $props()

  const {data: products} = $derived(data)
</script>

<Shoes {products} />
