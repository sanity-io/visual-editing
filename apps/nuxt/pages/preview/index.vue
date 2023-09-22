<template>
  <ClientOnly>
    <VisualEditing>
      <div class="flex flex-col justify-center p-8">
        <div
          class="rounded border p-4"
          :data-sanity="encodeSanityNodeData(sanityTitleData)"
        >
          Title Element
        </div>
        <div class="mx-auto my-8 h-[50vh] w-px bg-neutral-200"></div>
        <div
          class="rounded border p-4"
          :data-sanity="encodeSanityNodeData(sanityDescData)"
        >
          Description Element
        </div>
        <div class="mx-auto my-8 h-[50vh] w-px bg-neutral-200"></div>
        <div
          class="rounded border p-4"
          :data-sanity="encodeSanityNodeData(sanityCopyrightData)"
        >
          Copyright Element
        </div>
      </div>
    </VisualEditing>
  </ClientOnly>
</template>

<script lang="ts" setup>
import { encodeSanityNodeData } from '@sanity/overlays'

const sanityTitleData = {
  projectId: 'projectId',
  dataset: 'dataset',
  id: 'documentId',
  path: 'title',
  baseUrl: '/studio',
  workspace: 'docs',
  tool: 'composer',
}
const sanityDescData = {
  projectId: 'projectId',
  dataset: 'dataset',
  id: 'documentId',
  path: 'description',
  baseUrl: '/studio',
  workspace: 'docs',
  tool: 'composer',
}
const sanityCopyrightData = {
  projectId: 'projectId',
  dataset: 'dataset',
  id: 'documentId',
  path: 'copyrightText',
  baseUrl: '/studio',
  workspace: 'docs',
  tool: 'composer',
}
</script>
