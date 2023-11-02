TODO placeholder, explains basic setup and links to public packages and their readmes

## Should I use `@sanity/react-loader` or `@sanity/preview-kit`/`next-sanity/preview`

The `@sanity/preview-kit` stack will only ever handle live previewing of draft content (`perspective: "previewDrafts"` + `@sanity/groq-store`). It won't handle data fetching in production.

The `@sanity/react-loader` stack handles data fetching both for production content (`perspective: "published"`), and draft content (`perspective: "previewDrafts"`). It also handles live previewing of draft content when used with `@sanity/presentation`.

## Using `@sanity/react-loader` outside of `@sanity/presentation`, "stand-alone" mode

If you need to have live preview of content that can run outside of the iframe in `@sanity/presentation`, hosted by a Sanity Studio, then `@sanity/preview-kit` supports that.
`@sanity/react-loader` will support this use case in the future.

## Stega or `data-sanity` attributes?

If you plan on using the Vercel Visual Editing feature on Vercel Preview Deployments then we recommend using `@sanity/client/stega`, instead of `data-sanity` attributes. `@sanity/overlays` and `@sanity/presentation` fully supports stega, while Vercel Visual Editing doesn't support `data-sanity` attributes.
