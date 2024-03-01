<script>
</script>

<svelte:head>
  <title>Home</title>
  <meta name="description" content="Svelte" />
</svelte:head>

<div class="flex min-h-screen flex-col items-center justify-center gap-4">
  <h1 class="text-xl font-bold">Choose a Svelte application</h1>
  <div class="flex gap-2">
    <a
      class="rounded-full border p-2 px-4 font-medium shadow-md transition hover:shadow-lg focus:shadow-lg"
      href="/shoes">Without Loaders &rarr;</a
    >
    <a
      class="rounded-full border p-2 px-4 font-medium shadow-md transition hover:shadow-lg focus:shadow-lg"
      href="/shoes-with-loaders">With Loaders &rarr;</a
    >
  </div>
</div>
