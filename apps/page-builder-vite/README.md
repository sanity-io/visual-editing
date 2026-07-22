# page-builder-vite

A Vite + React SPA duplicate of `apps/page-builder-demo` that uses the **core loaders**
(`@sanity/react-loader` on top of `@sanity/core-loader`) instead of `next-sanity`.

It targets the same project/dataset (`hiomol4a` / `preview-poc`) and renders the same
page-builder content (front page, `/pages/:slug`, `/products`, `/product/:slug`).

The page-builder components, GROQ queries and generated types are shared with
`apps/page-builder-demo` through the internal `@repo/page-builder-shared` package;
framework-specific pieces (link component, image renderer, `dataAttribute`) are
injected via its `PageBuilderProvider`.

## Why

The core loaders receive the perspective **and editing variant** directly from
Presentation over comlink (`loader/perspective` → `loader/query-listen`/`loader/query-change`),
so content updates react instantly to perspective/variant switches in the Studio —
no draft-mode cookies or router refresh roundtrip involved. This makes the app a good
test bed for content experimentation variants in Presentation.

## Run

```sh
pnpm build # build workspace packages first, from the repo root
pnpm --filter page-builder-vite dev # serves on http://localhost:3007
```

Then open the Studio (`apps/studio`, http://localhost:3333/page-builder-vite) — the
`page-builder-vite` workspace previews this app in its Presentation tool.

Outside Presentation the app fetches published content anonymously (no token needed).
A status badge in the bottom-right corner shows the perspective, variant and
visual editing environment currently in use.
