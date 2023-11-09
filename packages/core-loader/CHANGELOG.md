# Changelog

## [0.7.3-pink-lizard](https://github.com/sanity-io/visual-editing/compare/core-loader-v0.7.2-pink-lizard...core-loader-v0.7.3-pink-lizard) (2023-11-09)


### Bug Fixes

* only set cache in live mode on a valid connection ([d0d05a5](https://github.com/sanity-io/visual-editing/commit/d0d05a518f5c04c6ff935a595b0b4bc135e5fd0f))
* set initial `loading` to `false` when hydrated ([b18d0f5](https://github.com/sanity-io/visual-editing/commit/b18d0f55bff74975ebeca386b728271a7e731614))

## [0.7.2-pink-lizard](https://github.com/sanity-io/visual-editing/compare/core-loader-v0.7.1-pink-lizard...core-loader-v0.7.2-pink-lizard) (2023-11-08)


### Bug Fixes

* **deps:** update dependency @sanity/client to v6.8.0-pink-lizard.12 ([#301](https://github.com/sanity-io/visual-editing/issues/301)) ([c939d32](https://github.com/sanity-io/visual-editing/commit/c939d323065a0f9c287174befbb84b0d1dfeb2e6))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @sanity/groq-store bumped to 5.2.6-pink-lizard

## [0.7.1-pink-lizard](https://github.com/sanity-io/visual-editing/compare/core-loader-v0.7.0-pink-lizard...core-loader-v0.7.1-pink-lizard) (2023-11-08)


### Bug Fixes

* **deps:** update dependency @sanity/client to v6.8.0-pink-lizard.12 ([#298](https://github.com/sanity-io/visual-editing/issues/298)) ([4bfbfff](https://github.com/sanity-io/visual-editing/commit/4bfbfffb8fab9e3440fb525babd2df0120fc4900))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @sanity/groq-store bumped to 5.2.5-pink-lizard

## [0.7.0-pink-lizard](https://github.com/sanity-io/visual-editing/compare/core-loader-v0.6.0-pink-lizard...core-loader-v0.7.0-pink-lizard) (2023-11-08)


### ⚠ BREAKING CHANGES

* `initialData` and `initialSourceMap` are now grouped by `initial`

### Bug Fixes

* `initialData` and `initialSourceMap` are now grouped by `initial` ([30f8cfd](https://github.com/sanity-io/visual-editing/commit/30f8cfdf284c940e5589820e1c72b5c50da17cbd))
* **deps:** update dependency @sanity/client to v6.8.0-pink-lizard.9 ([#295](https://github.com/sanity-io/visual-editing/issues/295)) ([6335f36](https://github.com/sanity-io/visual-editing/commit/6335f36c0c5324499ccbd42256e3a5d317e3a709))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @sanity/groq-store bumped to 5.2.4-pink-lizard

## [0.6.0-pink-lizard](https://github.com/sanity-io/visual-editing/compare/core-loader-v0.5.3-pink-lizard...core-loader-v0.6.0-pink-lizard) (2023-11-08)


### Features

* support SSR-only mode ([96d82f2](https://github.com/sanity-io/visual-editing/commit/96d82f2873d358353102181a10913d34949d645f))


### Bug Fixes

* **deps:** update dependency @sanity/client to v6.8.0-pink-lizard.8 ([#291](https://github.com/sanity-io/visual-editing/issues/291)) ([9623639](https://github.com/sanity-io/visual-editing/commit/9623639ac7c333ee7b13c253a61a7f9d4f9f599a))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @sanity/groq-store bumped to 5.2.3-pink-lizard

## [0.5.3-pink-lizard](https://github.com/sanity-io/visual-editing/compare/core-loader-v0.5.2-pink-lizard...core-loader-v0.5.3-pink-lizard) (2023-11-08)


### Bug Fixes

* **deps:** update dependency @sanity/client to v6.8.0-pink-lizard.7 ([#288](https://github.com/sanity-io/visual-editing/issues/288)) ([7d63682](https://github.com/sanity-io/visual-editing/commit/7d63682b533495e75cdcef446e818e10b742329b))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @sanity/groq-store bumped to 5.2.2-pink-lizard

## [0.5.2-pink-lizard](https://github.com/sanity-io/visual-editing/compare/core-loader-v0.5.1-pink-lizard...core-loader-v0.5.2-pink-lizard) (2023-11-08)


### Bug Fixes

* **deps:** update dependency `@sanity/client` to v6.8.0-pink-lizard.5 ([c88e4ec](https://github.com/sanity-io/visual-editing/commit/c88e4ec3a12c4dd3d5bac5c3e9c39a52fc698603))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @sanity/groq-store bumped to 5.2.1-pink-lizard

## [0.5.1-pink-lizard](https://github.com/sanity-io/visual-editing/compare/core-loader-v0.5.0-pink-lizard...core-loader-v0.5.1-pink-lizard) (2023-11-08)


### Bug Fixes

* remove `console.log` ([b84d3f3](https://github.com/sanity-io/visual-editing/commit/b84d3f3ebde6f1f6989da473fefad6acff57028f))

## [0.5.0-pink-lizard](https://github.com/sanity-io/visual-editing/compare/core-loader-v0.4.4-pink-lizard...core-loader-v0.5.0-pink-lizard) (2023-11-08)


### ⚠ BREAKING CHANGES

* lazy load live mode ([#281](https://github.com/sanity-io/visual-editing/issues/281))
* renamed `studioUrl` to `allowStudioOrigin`to clarify it's CORS related

### Bug Fixes

* lazy load live mode ([#281](https://github.com/sanity-io/visual-editing/issues/281)) ([e52991c](https://github.com/sanity-io/visual-editing/commit/e52991cc974df76647c4ede51de16527c14e6c10))
* renamed `studioUrl` to `allowStudioOrigin`to clarify it's CORS related ([589a7c2](https://github.com/sanity-io/visual-editing/commit/589a7c29ef61bb53f249847b4d5b9ae78ad252f2))

## [0.4.4-pink-lizard](https://github.com/sanity-io/visual-editing/compare/core-loader-v0.4.3-pink-lizard...core-loader-v0.4.4-pink-lizard) (2023-11-07)


### Bug Fixes

* **deps:** update dependency @sanity/client to v6.8.0-pink-lizard.4 ([#278](https://github.com/sanity-io/visual-editing/issues/278)) ([f9a64c4](https://github.com/sanity-io/visual-editing/commit/f9a64c4f245da1f7beb3052fb205f422ec94221e))

## [0.4.3-pink-lizard](https://github.com/sanity-io/visual-editing/compare/core-loader-v0.4.2-pink-lizard...core-loader-v0.4.3-pink-lizard) (2023-11-07)


### Bug Fixes

* update stega implementation ([26cc0e7](https://github.com/sanity-io/visual-editing/commit/26cc0e7ed02bf194a16d337669895b02aa4b1922))

## [0.4.2-pink-lizard](https://github.com/sanity-io/visual-editing/compare/core-loader-v0.4.1-pink-lizard...core-loader-v0.4.2-pink-lizard) (2023-11-07)


### Bug Fixes

* **deps:** update dependency @sanity/client to v6.8.0-pink-lizard.3 ([#267](https://github.com/sanity-io/visual-editing/issues/267)) ([432f47b](https://github.com/sanity-io/visual-editing/commit/432f47bdd742cc863bbeb257325690b0f2063022))

## [0.4.1-pink-lizard](https://github.com/sanity-io/visual-editing/compare/core-loader-v0.4.0-pink-lizard...core-loader-v0.4.1-pink-lizard) (2023-11-05)


### Bug Fixes

* **deps:** update dependency @sanity/client to v6.8.0-pink-lizard.0 ([#264](https://github.com/sanity-io/visual-editing/issues/264)) ([010b87a](https://github.com/sanity-io/visual-editing/commit/010b87a5afbc3619a3406db405299522456854a2))

## [0.4.0-pink-lizard](https://github.com/sanity-io/visual-editing/compare/core-loader-v0.3.6-pink-lizard...core-loader-v0.4.0-pink-lizard) (2023-11-04)


### Features

* use the new `@sanity/client/stega` features ([#252](https://github.com/sanity-io/visual-editing/issues/252)) ([fa08bb2](https://github.com/sanity-io/visual-editing/commit/fa08bb24e6413bfa49adb79df256217e06ed0844))


### Bug Fixes

* **deps:** update dependency @sanity/client to v6.7.1-pink-lizard.2 ([#251](https://github.com/sanity-io/visual-editing/issues/251)) ([9f66693](https://github.com/sanity-io/visual-editing/commit/9f66693bd2e954f54987e9352f35f3fccab3ad6f))
* **deps:** update dependency @sanity/client to v6.7.1-pink-lizard.5 ([#259](https://github.com/sanity-io/visual-editing/issues/259)) ([8f2f00f](https://github.com/sanity-io/visual-editing/commit/8f2f00faef5a91dd11218b05be4c76da2ec45e0e))
* handle stega nodes in a way that supports focus ([#254](https://github.com/sanity-io/visual-editing/issues/254)) ([dce801f](https://github.com/sanity-io/visual-editing/commit/dce801f3b76e6e2bb0597345b5deacc2038e6fec))

## [0.3.6-pink-lizard](https://github.com/sanity-io/visual-editing/compare/core-loader-v0.3.5-pink-lizard...core-loader-v0.3.6-pink-lizard) (2023-11-03)


### Bug Fixes

* strip relative paths from cors targetOrigin ([c2b5b3b](https://github.com/sanity-io/visual-editing/commit/c2b5b3b781af0852bfb798f96b9c685c15f90cc0))

## [0.3.5-pink-lizard](https://github.com/sanity-io/visual-editing/compare/core-loader-v0.3.4-pink-lizard...core-loader-v0.3.5-pink-lizard) (2023-11-02)


### Bug Fixes

* **README:** add badges and links ([0fcf516](https://github.com/sanity-io/visual-editing/commit/0fcf516fb0a920c01cb4a153863d256e39395024))

## [0.3.4-pink-lizard](https://github.com/sanity-io/visual-editing/compare/core-loader-v0.3.3-pink-lizard...core-loader-v0.3.4-pink-lizard) (2023-11-02)


### Bug Fixes

* **deps:** pin dependencies ([#239](https://github.com/sanity-io/visual-editing/issues/239)) ([e1583b9](https://github.com/sanity-io/visual-editing/commit/e1583b99eb45342ffbddb68c1af66b33bc9a25d1))
* make `@sanity/groq-store` a regular dep ([b5b4490](https://github.com/sanity-io/visual-editing/commit/b5b449039002b76a83b5e170d1e2775cbd157989))

## [0.3.3-pink-lizard](https://github.com/sanity-io/visual-editing/compare/core-loader-v0.3.2-pink-lizard...core-loader-v0.3.3-pink-lizard) (2023-11-02)


### Bug Fixes

* add base readmes ([e5f3f70](https://github.com/sanity-io/visual-editing/commit/e5f3f7054090c269a98bc5d5f6ff9572a8c3725b))
* add README ([3c14ea1](https://github.com/sanity-io/visual-editing/commit/3c14ea1b362d6287f51b6af6d56c896574cd932b))
* always bundle private packages ([6be3f74](https://github.com/sanity-io/visual-editing/commit/6be3f7409216c699667d6ac400b4ce3b3a426679))
* **deps:** update dependency @sanity/client to v6.7.1-pink-lizard.0 ([#224](https://github.com/sanity-io/visual-editing/issues/224)) ([937c5cb](https://github.com/sanity-io/visual-editing/commit/937c5cbe290a260c1f0a0dccbab7c46b4ef50767))
* **deps:** Update sanity monorepo ([#222](https://github.com/sanity-io/visual-editing/issues/222)) ([dec2114](https://github.com/sanity-io/visual-editing/commit/dec2114132de1b98da5a78f92def08a5528528a7))
* load src directly ([94308f0](https://github.com/sanity-io/visual-editing/commit/94308f0ba815d89347c7201eb759cc0ba6e2bbf7))
* prepare release ([f2ce9cb](https://github.com/sanity-io/visual-editing/commit/f2ce9cb4046df2cb7581e66fcad3a5c0631778ae))

## [0.3.2-pink-lizard](https://github.com/sanity-io/visual-editing/compare/core-loader-v0.3.1-pink-lizard...core-loader-v0.3.2-pink-lizard) (2023-10-27)


### Bug Fixes

* **refactor:** composer to pages ([#202](https://github.com/sanity-io/visual-editing/issues/202)) ([e46f475](https://github.com/sanity-io/visual-editing/commit/e46f475c50438339f5c95ccf3930f9d16c43dc4b))

## [0.3.1-pink-lizard](https://github.com/sanity-io/visual-editing/compare/core-loader-v0.3.0-pink-lizard...core-loader-v0.3.1-pink-lizard) (2023-10-26)


### Bug Fixes

* remove unused code ([00e1366](https://github.com/sanity-io/visual-editing/commit/00e1366f161960d4ac58890c388f236432b6f981))
* stable "documents in use" rendering ([6e66f1d](https://github.com/sanity-io/visual-editing/commit/6e66f1dfb7838a08559579c925e04ab0bec76ecf))

## [0.3.0-pink-lizard](https://github.com/sanity-io/visual-editing/compare/core-loader-v0.2.1-pink-lizard...core-loader-v0.3.0-pink-lizard) (2023-10-25)


### Features

* add `query` API for React SSR ([e86ce61](https://github.com/sanity-io/visual-editing/commit/e86ce6151d21ce12a302d62c8346035eb78cdfc3))
* expose `unstable__cache` API for SSR ([9300036](https://github.com/sanity-io/visual-editing/commit/9300036adcdb6a7de60cfafaab58fed67c558200))


### Bug Fixes

* **deps:** upgrade `@sanity/pkg-utils` ([9236c86](https://github.com/sanity-io/visual-editing/commit/9236c86fd37a2e4dff4d5a8142846fc2a96bc538))
* update live queries whenever adding a new query ([fafb057](https://github.com/sanity-io/visual-editing/commit/fafb057c5dcd73fc08b30ae7e80ccf57be26e301))

## [0.2.1-pink-lizard](https://github.com/sanity-io/visual-editing/compare/core-loader-v0.2.0-pink-lizard...core-loader-v0.2.1-pink-lizard) (2023-10-24)


### Bug Fixes

* temp disable minify for debugging ([93265ae](https://github.com/sanity-io/visual-editing/commit/93265ae870ec204a2753665a3e435a573ab5d862))

## [0.2.0-pink-lizard](https://github.com/sanity-io/visual-editing/compare/core-loader-v0.1.8-pink-lizard...core-loader-v0.2.0-pink-lizard) (2023-10-24)


### Features

* enable warp speed editing ([#181](https://github.com/sanity-io/visual-editing/issues/181)) ([6438f25](https://github.com/sanity-io/visual-editing/commit/6438f25d1421268fbf269ae8bc95f624e363be24))


### Bug Fixes

* channels improvements ([#180](https://github.com/sanity-io/visual-editing/issues/180)) ([182cb48](https://github.com/sanity-io/visual-editing/commit/182cb489efb6e5413303fa60d33e8b6c012a0cd3))

## [0.1.8-pink-lizard](https://github.com/sanity-io/visual-editing/compare/core-loader-v0.1.7-pink-lizard...core-loader-v0.1.8-pink-lizard) (2023-10-23)


### Bug Fixes

* disable minification to ease debugging ([666f8e0](https://github.com/sanity-io/visual-editing/commit/666f8e07565a566291c7a19b7dfe65a12aed49a5))
* track studio origin ([209d5f2](https://github.com/sanity-io/visual-editing/commit/209d5f24a38c9dbbe21c882043bcd9ae177321a8))

## [0.1.7-pink-lizard](https://github.com/sanity-io/visual-editing/compare/core-loader-v0.1.6-pink-lizard...core-loader-v0.1.7-pink-lizard) (2023-10-23)


### Bug Fixes

* generate typings from bundled packages ([8201fa7](https://github.com/sanity-io/visual-editing/commit/8201fa7895c8511b44c7a7344d29a183ef2cf87b))

## [0.1.6-pink-lizard](https://github.com/sanity-io/visual-editing/compare/core-loader-v0.1.5-pink-lizard...core-loader-v0.1.6-pink-lizard) (2023-10-23)


### Bug Fixes

* remove debug console loggers ([84f4b1d](https://github.com/sanity-io/visual-editing/commit/84f4b1d06196161e94aa2333fbf5f9cbef0cc51c))

## [0.1.5-pink-lizard](https://github.com/sanity-io/visual-editing/compare/core-loader-v0.1.4-pink-lizard...core-loader-v0.1.5-pink-lizard) (2023-10-23)


### Bug Fixes

* **pink-lizard:** remove unnecessary suffix ([c7409aa](https://github.com/sanity-io/visual-editing/commit/c7409aa698a5f6e332b05537441efd0df8d33b95))

## [0.1.4-pink-lizard.0](https://github.com/sanity-io/visual-editing/compare/core-loader-v0.1.3-pink-lizard.0...core-loader-v0.1.4-pink-lizard.0) (2023-10-19)


### Bug Fixes

* add barebones svelte loader ([d4b9409](https://github.com/sanity-io/visual-editing/commit/d4b9409051823627ffe7aa0693fefdca666bd0d7))

## [0.1.3-pink-lizard.0](https://github.com/sanity-io/visual-editing/compare/core-loader-v0.1.2-pink-lizard.0...core-loader-v0.1.3-pink-lizard.0) (2023-10-19)


### Bug Fixes

* make `withKeyArraySelector` the default ([7985233](https://github.com/sanity-io/visual-editing/commit/79852338036dbbd3ac12723ff00250bf41154bff))

## [0.1.2-pink-lizard.0](https://github.com/sanity-io/visual-editing/compare/core-loader-v0.1.1-pink-lizard.0...core-loader-v0.1.2-pink-lizard.0) (2023-10-19)


### Bug Fixes

* include `CHANGELOG.md` files in private packages ([9967f1c](https://github.com/sanity-io/visual-editing/commit/9967f1c8edca69737842e1807cf8f9e725fbcd07))

## [0.1.1-pink-lizard.0](https://github.com/sanity-io/visual-editing/compare/core-loader-v0.1.0-pink-lizard.0...core-loader-v0.1.1-pink-lizard.0) (2023-10-19)


### Bug Fixes

* allow setting `resultSourceMap` to other options ([0af005f](https://github.com/sanity-io/visual-editing/commit/0af005fdac8693e2e893de80f7f761b13cf068c3))
* **deps:** update dependency @sanity/client to ^6.7.0 ([85d542f](https://github.com/sanity-io/visual-editing/commit/85d542f75888361bebf80ca7c84f6400ae311a63))

## [0.1.0-pink-lizard.0](https://github.com/sanity-io/visual-editing/compare/core-loader-v0.0.1-pink-lizard.0...core-loader-v0.1.0-pink-lizard.0) (2023-10-19)


### Features

* time for `@sanity/nuxt-loader` ([d489596](https://github.com/sanity-io/visual-editing/commit/d489596f2b9df4f14da9f0fddeb5a1c01c346457))


### Bug Fixes

* add `@sanity/client` to peer deps ([acf0bd0](https://github.com/sanity-io/visual-editing/commit/acf0bd09eced687de5ffbc4afa79dee576e1cc72))
* support refresh ([2ef0ac5](https://github.com/sanity-io/visual-editing/commit/2ef0ac5e22d831c35bdc0b42fb25dde537f4114a))
* track if channels are healthy ([4cc24a0](https://github.com/sanity-io/visual-editing/commit/4cc24a08bcfd318f4006d7c8f062d70764e22c65))
