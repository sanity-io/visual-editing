<template>
  <div class="mx-auto flex max-w-lg flex-col justify-center p-16">
    <div
      class="rounded border p-4"
      :data-sanity="encodeSanityNodeData(sanityTitleData)"
    >
      Foo
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
</template>

<script lang="ts" setup>
import { encodeSanityNodeData } from 'visual-editing-helpers/csm'

const sanityTitleData = {
  projectId: 'projectId',
  dataset: 'dataset',
  id: 'siteSettings',
  type: 'siteSettings',
  path: 'title',
  baseUrl: '/studio',
  workspace: 'docs',
  tool: 'presentation',
}

const sanityDescData = {
  projectId: 'projectId',
  dataset: 'dataset',
  id: 'siteSettings',
  type: 'siteSettings',
  path: 'description',
  baseUrl: '/studio',
  workspace: 'docs',
  tool: 'presentation',
}
const sanityCopyrightData = {
  projectId: 'projectId',
  dataset: 'dataset',
  id: 'siteSettings',
  type: 'siteSettings',
  path: 'copyrightText',
  baseUrl: '/studio',
  workspace: 'docs',
  tool: 'presentation',
}
</script>
