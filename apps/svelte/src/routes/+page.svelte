<svelte:head>
  <title>Home</title>
  <meta name="description" content="Svelte" />
</svelte:head>

<div
  class="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-br from-blue-100 to-orange-100"
>
  <h1 class="font-heavy text-medium">Svelte with Visual Editing examples</h1>
  <div class="flex gap-3">
    <a
      class="rounded-lg border bg-white p-2 px-4 font-medium shadow-md transition hover:shadow-lg focus:shadow-lg"
      href="/shoes">Basic &rarr;</a
    >
    <a
      class="rounded-lg border bg-white p-2 px-4 font-medium shadow-md transition hover:shadow-lg focus:shadow-lg"
      href="/shoes-query-loader">Query Loaders &rarr;</a
    >
    <a
      class="rounded-lg border bg-white p-2 px-4 font-medium shadow-md transition hover:shadow-lg focus:shadow-lg"
      href="/shoes-live-loader">Live Content &rarr;</a
    >
  </div>
</div>
