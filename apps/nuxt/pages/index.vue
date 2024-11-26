<template>
  <main
    class="flex flex-col items-center justify-between p-8 lg:p-24"
    :class="[
      expandedDocument ? 'min-h-[200vh]' : 'min-h-screen',
      {'transition-all duration-500': animateDocument},
    ]"
  >
    <div
      class="flex w-full flex-col items-center justify-start gap-4 font-mono text-sm lg:max-w-5xl lg:flex-row"
    >
      <button class="button" type="button" @click.prevent="(elementAdded = !elementAdded)">
        {{ elementAdded ? 'Remove' : 'Add' }} Dynamic Element
      </button>
      <button class="button" type="button" @click.prevent="(expandedDocument = !expandedDocument)">
        {{ expandedDocument ? 'Contract' : 'Expand' }} Document
      </button>
      <button class="button" type="button" @click.prevent="(animateDocument = !animateDocument)">
        {{ animateDocument ? 'Disable' : 'Enable' }} Animation
      </button>
    </div>

    <div
      class="before:bg-gradient-radial after:bg-gradient-conic relative z-[-1] my-12 flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:lg:h-[360px] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40"
    >
      <a href="https://nuxt.com" target="_blank">
        <svg
          width="61"
          height="42"
          viewBox="0 0 61 42"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M33.9869 41.2211H56.412C57.1243 41.2212 57.824 41.0336 58.4408 40.6772C59.0576 40.3209 59.5698 39.8083 59.9258 39.191C60.2818 38.5737 60.469 37.8736 60.4687 37.1609C60.4684 36.4482 60.2805 35.7482 59.924 35.1313L44.864 9.03129C44.508 8.41416 43.996 7.90168 43.3793 7.54537C42.7626 7.18906 42.063 7.00147 41.3509 7.00147C40.6387 7.00147 39.9391 7.18906 39.3225 7.54537C38.7058 7.90168 38.1937 8.41416 37.8377 9.03129L33.9869 15.7093L26.458 2.65061C26.1018 2.03354 25.5895 1.52113 24.9726 1.16489C24.3557 0.808639 23.656 0.621094 22.9438 0.621094C22.2316 0.621094 21.5318 0.808639 20.915 1.16489C20.2981 1.52113 19.7858 2.03354 19.4296 2.65061L0.689224 35.1313C0.332704 35.7482 0.144842 36.4482 0.144532 37.1609C0.144222 37.8736 0.331476 38.5737 0.687459 39.191C1.04344 39.8083 1.5556 40.3209 2.17243 40.6772C2.78925 41.0336 3.48899 41.2212 4.20126 41.2211H18.2778C23.8551 41.2211 27.9682 38.7699 30.7984 33.9876L37.6694 22.0813L41.3498 15.7093L52.3951 34.8492H37.6694L33.9869 41.2211ZM18.0484 34.8426L8.2247 34.8404L22.9504 9.32211L30.2979 22.0813L25.3784 30.6092C23.4989 33.7121 21.3637 34.8426 18.0484 34.8426Z"
            fill="#00DC82"
          />
        </svg>
      </a>
    </div>
    <div class="mb-32 grid w-full text-center lg:mb-0 lg:max-w-5xl lg:grid-cols-3 lg:text-left">
      <div class="block" :data-sanity-edit-info="JSON.stringify(sanityEditData)">
        <h2>JSON data attribute</h2>
        <p>data-sanity-edit-info</p>
      </div>

      <div class="block" :data-sanity="JSON.stringify(sanityData)">
        <h2>JSON data attribute</h2>
        <p>data-sanity</p>
      </div>

      <div class="block">
        <h2>Stega string</h2>
        <p>
          <span>
            <span>
              {{ vercelStegaCombine('Nested stega in inline element', sanityEditData) }}
            </span>
          </span>
        </p>
      </div>

      <div class="block" data-sanity-edit-target>
        <h2>Target</h2>
        <p>
          {{ vercelStegaCombine('First stega', sanityEditData) }}
        </p>
        <p>
          {{ vercelStegaCombine('Second stega', sanityEditData) }}
        </p>
      </div>

      <div class="block" data-sanity-edit-target>
        <h2>Target (Info)</h2>
        <div class="m-0 text-sm opacity-50">
          <div :data-sanity="JSON.stringify(sanityData)">First data-sanity</div>
          <div :data-sanity="JSON.stringify(sanityDataDiff)">Second data-sanity</div>
        </div>
      </div>

      <div
        v-if="elementAdded"
        class="block"
        :data-sanity-edit-info="JSON.stringify(sanityEditData)"
      >
        <h2>Dynamic element</h2>
        <p>
          {{ vercelStegaCombine('Nested stega', sanityEditData) }}
        </p>
      </div>
    </div>
  </main>
</template>

<script lang="ts" setup>
import {vercelStegaCombine} from '@vercel/stega'

const elementAdded = ref(false)
const expandedDocument = ref(false)
const animateDocument = ref(false)

useHead({
  bodyAttrs: {
    class: 'nextStyle',
  },
})

const sanityEditData = {
  origin: 'sanity.io',
  href: 'https://next.sanity.build/studio/desk',
}

const sanityData = {
  projectId: 'projectId',
  dataset: 'dataset',
  id: 'documentId',
  path: 'sections[_key=="abcdef"].object.primary.common',
  baseUrl: 'https://some.sanity.studio',
  workspace: 'docs',
  tool: 'desk',
}

const sanityDataDiff = {
  projectId: 'projectId',
  dataset: 'dataset',
  id: 'documentId',
  path: 'sections[_key=="abcdef"].object.secondary.common.ext',
  baseUrl: 'https://some.sanity.studio',
  tool: 'desk',
  workspace: 'docs',
}
</script>

<style lang="postcss" scoped>
.button {
  @apply w-full rounded-xl border border-gray-300 bg-gray-200 bg-gradient-to-b from-zinc-200 p-4 text-center backdrop-blur-2xl lg:w-auto dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit;
}
.block {
  @apply rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30;
}

.block h2 {
  @apply mb-3 text-2xl font-semibold;
}
.block p {
  @apply m-0 text-sm opacity-50;
}
</style>
