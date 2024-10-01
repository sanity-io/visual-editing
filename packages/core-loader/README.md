# @sanity/core-loader

[![npm stat](https://img.shields.io/npm/dm/@sanity/core-loader.svg?style=flat-square)](https://npm-stat.com/charts.html?package=@sanity/core-loader)
[![npm version](https://img.shields.io/npm/v/@sanity/core-loader.svg?style=flat-square)](https://www.npmjs.com/package/@sanity/core-loader)
[![gzip size][gzip-badge]][bundlephobia]
[![size][size-badge]][bundlephobia]

```sh
npm install @sanity/core-loader @sanity/client
```
core-loader uses [nanostores](https://github.com/nanostores/nanostores) to poll a Sanity Studio for changes and expose those changes via a listener.

## createQueryStore
`createQueryStore` initializes the loader, it takes 3 arguments:
* `client` - An initialized Sanity client
* `ssr` - Optional (defaults to `false`): Boolean to flag if you plan to fetch production data on the server
* `tag` - Optional (defaults to `core-loader`): An ID for API request logs to easily determine the source of API traffic

```javascript
const queryStore = createQueryStore({
    client,
})
```

Once initialized, createQueryStore exposes 3 methods
### createFetcherStore
`createFetcherStore` fetches a given query and (when `liveMode` is enabled) re-fetches as changes are made in the Studio, it takes 3 arguments:
* query - A GROQ query
* params - Optional object of parameters for the query
* initial - If using SSR, the initial server-fetched data 

```javascript
const fetcherStore = queryStore.createFetcherStore(query, {}, initial) 
```

Once initialized `createFetcherStore` provides a `subscribe` function that returns the query response and when combined with `enableLiveMode` will allow for live visual editing.
```javascript
// Listen for changes + re-render HTML in response
fetcherStore.subscribe(({loading, data}) => {
    if (!loading && data) {
        renderHtml(data)
    }
})
```

### enableLiveMode
`enableLiveMode` tells the query store to poll the Sanity Studio for changes and re-run the query passed to `createFetcherStore`. It takes a `client` but its important that the following `stega` information is part of the client's config.
```javascript
queryStore.enableLiveMode({
    client: client.config({
        stega: {
            enabled: true, // enable stega encoding for visual editing to pick up on
            studioUrl: 'http://localhost:3333', // only show overlays when inside the Studio
        },
    }),
})
```
To allow `liveMode` to work within your Studio, you'll also need to call `enableVisualEditing` from the `@sanity/visual-editing` package


[gzip-badge]: https://img.shields.io/bundlephobia/minzip/@sanity/core-loader?label=gzip%20size&style=flat-square
[size-badge]: https://img.shields.io/bundlephobia/min/@sanity/core-loader?label=size&style=flat-square
[bundlephobia]: https://bundlephobia.com/package/@sanity/core-loader
