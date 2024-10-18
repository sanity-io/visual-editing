<template>
  <div class="min-h-screen bg-white">
    <nav aria-label="Breadcrumb" class="pt-16 sm:pt-24">
      <ol class="mx-auto flex max-w-2xl items-center space-x-2 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <li>
          <div class="flex items-center">
            <NuxtLink :to="{name: 'shoes'}" class="mr-2 text-sm font-medium text-gray-900">
              Shoes
            </NuxtLink>
            <svg
              width="{16}"
              height="{20}"
              viewBox="0 0 16 20"
              fill="currentColor"
              aria-hidden="true"
              class="h-5 w-4 text-gray-300"
            >
              <path d="M5.697 4.34L8.98 16.532h1.327L7.025 4.341H5.697z" />
            </svg>
          </div>
        </li>
        <li class="text-sm" :style="{textWrap: 'balance'}">
          <NuxtLink
            :to="{
              name: 'shoes-slug',
              params: {slug: route.params.slug},
            }"
            aria-current="page"
            class="font-medium text-gray-500 hover:text-gray-600"
          >
            {{ pending ? 'Loading' : product?.title || 'Untitled' }}
          </NuxtLink>
        </li>
      </ol>
    </nav>

    <article v-if="product">
      <div
        v-if="coverImage?.asset"
        class="mx-auto max-w-2xl px-4 pt-16 sm:px-6 lg:max-w-7xl lg:px-8 lg:pt-24"
      >
        <img
          class="aspect-video w-full rounded-md object-cover object-center group-hover:opacity-75 lg:rounded-lg"
          :src="
            urlFor(coverImage)
              .width(1280 * 2)
              .height(720 * 2)
              .url()
          "
          width="1280"
          height="720"
          :alt="coverImage.alt || ''"
        />
      </div>
      <div
        v-if="otherImages.length > 0"
        class="mx-auto max-w-2xl px-4 pt-5 sm:px-6 lg:max-w-7xl lg:px-8 lg:pt-8"
      >
        <div class="relative flex w-full snap-x snap-mandatory gap-6 overflow-x-auto">
          <div
            v-for="image of otherImages.filter((image) => !!image.asset?._ref)"
            class="shrink-0 snap-start"
          >
            <img
              :data-sanity="
                createDataAttribute({
                  id: product._id,
                  type: 'shoe',
                  path: `media[_key=='${image._key}']`,
                }).toString()
              "
              class="h-32 w-40 shrink-0 rounded bg-white shadow-xl lg:rounded-lg"
              :src="
                urlFor(image)
                  .width(1280 / 2)
                  .height(720 / 2)
                  .url()
              "
              :width="1280 / 2"
              :height="720 / 2"
              :alt="stegaClean(image.alt) || ''"
            />
          </div>
        </div>
      </div>

      <!-- Product info -->
      <div
        class="mx-auto max-w-2xl px-4 pb-16 pt-10 sm:px-6 lg:grid lg:max-w-7xl lg:grid-cols-3 lg:grid-rows-[auto,auto,1fr] lg:gap-x-8 lg:px-8 lg:pb-24 lg:pt-16"
      >
        <div class="lg:col-span-2 lg:border-r lg:border-gray-200 lg:pr-8">
          <h1
            class="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl"
            :style="{textWrap: 'balance'}"
          >
            {{ product.title }}
          </h1>
        </div>

        <!-- Options -->
        <div class="mt-4 flex flex-col gap-y-6 lg:row-span-3 lg:mt-0">
          <h2 class="sr-only">Product information</h2>
          <p class="text-3xl tracking-tight text-gray-900">
            {{ product.price ? formatCurrency(product.price) : 'FREE' }}
          </p>

          <div v-if="product.brand?.name">
            <h2 class="text-sm font-medium text-gray-900">Brand</h2>
            <div class="flex items-center gap-x-2">
              <img
                class="h-10 w-10 rounded-full bg-gray-50"
                :src="
                  product.brand?.logo?.asset
                    ? urlForCrossDatasetReference(product.brand.logo).width(48).height(48).url()
                    : `https://source.unsplash.com/featured/48x48?${encodeURIComponent(
                        product.brand.name,
                      )}`
                "
                width="24"
                height="24"
                :alt="product.brand?.logo?.alt || ''"
              />
              <span class="text-lg font-bold">
                {{ product.brand.name }}
              </span>
            </div>
          </div>

          <form class="mt-3">
            <button
              type="button"
              class="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Add to bag
            </button>
          </form>
        </div>

        <div
          class="py-10 lg:col-span-2 lg:col-start-1 lg:border-r lg:border-gray-200 lg:pb-16 lg:pr-8 lg:pt-6"
        >
          <!-- Description and details -->
          <div>
            <h3 class="sr-only">Description</h3>

            <div class="space-y-6 text-base text-gray-900">
              <SanityContent v-if="product.description" :blocks="product.description" />
              <template v-else>No description</template>
            </div>
          </div>
        </div>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import {stegaClean} from '@sanity/client/stega'
import {createDataAttribute} from '@sanity/visual-editing'
import {shoe, type ShoeResult} from '~/queries'
import {formatCurrency, urlFor, urlForCrossDatasetReference} from '~/utils'

const route = useRoute()

const {data: product, pending} = await useSanityQuery<ShoeResult>(shoe, {
  slug: route.params.slug,
})

const coverImage = computed(() => product.value?.media?.[0])
const otherImages = computed(() => product.value?.media?.slice(1) || [])
</script>
