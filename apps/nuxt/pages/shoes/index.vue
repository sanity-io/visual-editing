<template>
  <div class="min-h-screen bg-white">
    <nav aria-label="Breadcrumb" class="pt-16 sm:pt-24">
      <ol class="mx-auto flex max-w-2xl items-center space-x-2 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <li>
          <div class="flex items-center">
            <NuxtLink
              :to="{name: 'shoes'}"
              aria-current="page"
              class="mr-2 text-sm font-medium text-gray-900"
            >
              Shoes
            </NuxtLink>
          </div>
        </li>
      </ol>
    </nav>
    <div class="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
      <h1 class="sr-only">Products</h1>

      <div v-if="pending" class="animate-pulse">Loading...</div>
      <div
        v-else
        class="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8"
      >
        <NuxtLink
          v-for="(product, i) of products || []"
          :key="product.slug.current"
          :to="{
            name: 'shoes-slug',
            params: {slug: product.slug.current},
          }"
          class="group relative"
        >
          <div
            class="aspect-h-1 aspect-w-1 xl:aspect-h-8 xl:aspect-w-7 w-full overflow-hidden rounded-lg bg-gray-200"
          >
            <img
              class="h-full w-full object-cover object-center group-hover:opacity-75"
              width="720"
              height="720"
              :src="
                product.media?.asset
                  ? urlFor(product.media).width(1440).height(1440).url()
                  : `https://source.unsplash.com/featured/720x720?shoes&r=${i}`
              "
              :alt="product.media?.alt || ''"
            />
          </div>
          <h2 class="mt-4 mb-8 text-sm text-gray-700" :style="{['textWrap' as any]: 'balance'}">
            {{ product.title }}
          </h2>
          <p class="absolute bottom-0 left-0 mt-1 text-lg font-medium text-gray-900">
            {{ product.price ? formatCurrency(product.price) : 'FREE' }}
          </p>
          <div v-if="product.brand" class="absolute right-0 bottom-0.5 flex items-center gap-x-2">
            <img
              class="h-6 w-6 rounded-full bg-gray-50"
              width="24"
              height="24"
              :src="
                product.brand?.logo?.asset
                  ? urlForCrossDatasetReference(product.brand.logo).width(48).height(48).url()
                  : `https://source.unsplash.com/featured/48x48?${
                      product.brand.name ? encodeURIComponent(product.brand.name) : `brand&r=${i}`
                    }`
              "
              :alt="product.brand?.logo?.alt || ''"
            />
            <span class="font-bold text-gray-600">
              {{ product.brand.name }}
            </span>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {shoesList, type ShoesListResult} from '~/queries'
import {formatCurrency, urlFor, urlForCrossDatasetReference} from '~/utils'

const {data: products, pending} = await useSanityQuery<ShoesListResult>(shoesList)
</script>
