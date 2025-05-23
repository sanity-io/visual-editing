<script lang="ts">
  import Shoe from '../../../components/Shoe.svelte'
  import type {PageProps} from './$types'

  const {data}: PageProps = $props()

  const {data: product} = $derived(data)
</script>

<Shoe {product} slug={product?.slug?.current} />
