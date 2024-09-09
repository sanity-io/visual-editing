<script lang="ts">
  import {page} from '$app/stores'
  import type {ShoesListResult} from '$lib/queries'
  import {urlFor, urlForCrossDatasetReference} from '$lib/sanity'
  import {formatCurrency} from '$lib/utils'

  export let loading: boolean = false
  export let products: ShoesListResult

  const basePath = $page.url.pathname
</script>

<svelte:head>
  <title>Shoes</title>
</svelte:head>

<div class="min-h-screen bg-white">
  <nav aria-label="Breadcrumb" class="pt-16 sm:pt-24">
    <ol class="mx-auto flex max-w-2xl items-center space-x-2 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
      <li>
        <div class="flex items-center">
          <a href={basePath} aria-current="page" class="mr-2 text-sm font-medium text-gray-900">
            Shoes
          </a>
        </div>
      </li>
    </ol>
  </nav>

  <div class="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
    <h1 class="sr-only">Products</h1>

    {#if loading}
      <div class="animate-pulse">Loading...</div>
    {:else if products}
      <div
        class="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8"
      >
        {#each products as product, i}
          <a href={`${basePath}/${product.slug.current}`} class="group relative">
            <div
              class="aspect-h-1 aspect-w-1 xl:aspect-h-8 xl:aspect-w-7 w-full overflow-hidden rounded-lg bg-gray-200"
            >
              <img
                class="h-full w-full object-cover object-center group-hover:opacity-75"
                width="720"
                height="720"
                src={product.media?.asset
                  ? urlFor(product.media).width(1440).height(1440).url()
                  : `https://source.unsplash.com/featured/720x720?shoes&r=${i}`}
                alt={product.media?.alt || ''}
              />
            </div>
            <h2 class="mb-8 mt-4 text-sm text-gray-700" style:text-wrap="balance">
              {product.title}
            </h2>
            <p class="absolute bottom-0 left-0 mt-1 text-lg font-medium text-gray-900">
              {product.price ? formatCurrency(product.price) : 'FREE'}
            </p>
            {#if product.brand}
              <div class="absolute bottom-0.5 right-0 flex items-center gap-x-2">
                <img
                  class="h-6 w-6 rounded-full bg-gray-50"
                  width="24"
                  height="24"
                  src={product.brand?.logo?.asset
                    ? urlForCrossDatasetReference(product.brand.logo).width(48).height(48).url()
                    : `https://source.unsplash.com/featured/48x48?${
                        product.brand.name ? encodeURIComponent(product.brand.name) : `brand&r=${i}`
                      }`}
                  alt={product.brand?.logo?.alt || ''}
                />
                <span class="font-bold text-gray-600">
                  {product.brand.name}
                </span>
              </div>
            {/if}
          </a>
        {/each}
      </div>
    {/if}
  </div>
</div>
