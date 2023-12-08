# Changelog

### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @sanity/channels bumped to 0.1.0

## [1.3.3](https://github.com/sanity-io/visual-editing/compare/preview-url-secret-v1.3.2...preview-url-secret-v1.3.3) (2023-12-08)


### Bug Fixes

* automatically generate a new url preview secret on expiry ([b1d74b1](https://github.com/sanity-io/visual-editing/commit/b1d74b18a9accda1b2366a6ba21762ff8f2fd860))
* only use `document.referrer` as fallback if its origin matches the preview origin ([d73d64f](https://github.com/sanity-io/visual-editing/commit/d73d64f5cc9d6a34f17b53e7f54fbab47b8a1983))

## [1.3.2](https://github.com/sanity-io/visual-editing/compare/preview-url-secret-v1.3.1...preview-url-secret-v1.3.2) (2023-12-07)


### Bug Fixes

* **deps:** update dependency @sanity/client to ^6.9.3 ([#517](https://github.com/sanity-io/visual-editing/issues/517)) ([39528c8](https://github.com/sanity-io/visual-editing/commit/39528c8dc3f4898ad596c686513d9c13df9368e1))

## [1.3.0](https://github.com/sanity-io/visual-editing/compare/preview-url-secret-v1.2.1...preview-url-secret-v1.3.0) (2023-12-05)


### Features

* add new `same-origin` option ([#471](https://github.com/sanity-io/visual-editing/issues/471)) ([09621ad](https://github.com/sanity-io/visual-editing/commit/09621ad85897d4c600cbf7a011f8ddcfed75841e))


### Bug Fixes

* allow relative preview URLs ([#481](https://github.com/sanity-io/visual-editing/issues/481)) ([06435cf](https://github.com/sanity-io/visual-editing/commit/06435cf6e65634db9df28f4833794ef245a9afe1))

## [1.2.1](https://github.com/sanity-io/visual-editing/compare/preview-url-secret-v1.2.0...preview-url-secret-v1.2.1) (2023-11-29)


### Bug Fixes

* **deps:** update dependency @sanity/client to ^6.9.0 ([#434](https://github.com/sanity-io/visual-editing/issues/434)) ([c7c8ec5](https://github.com/sanity-io/visual-editing/commit/c7c8ec59e6503060eb60800bac4a494e39c1595c))
* **deps:** update dependency @sanity/client to ^6.9.1 ([#437](https://github.com/sanity-io/visual-editing/issues/437)) ([6974b0d](https://github.com/sanity-io/visual-editing/commit/6974b0d6fabd9911af40f6a1de645473b47df19d))

## [1.2.0](https://github.com/sanity-io/visual-editing/compare/preview-url-secret-v1.1.0...preview-url-secret-v1.2.0) (2023-11-17)


### Features

* add `debugSecrets`  studio plugin that lets you easily see the generated url secrets in your dataset ([86ab7aa](https://github.com/sanity-io/visual-editing/commit/86ab7aaaa4a1edee4ac915f4b81c1a678bc14612))

## [1.1.0](https://github.com/sanity-io/visual-editing/compare/preview-url-secret-v1.0.2...preview-url-secret-v1.1.0) (2023-11-16)


### Features

* add `getRedirectTo` utility ([03591b5](https://github.com/sanity-io/visual-editing/commit/03591b50d60675d3d1a0eed1b66c7e528a63a1b7))
* return when the secret expires ([8f2c1ce](https://github.com/sanity-io/visual-editing/commit/8f2c1ceefcce73728488b2a3db73cbbee21cf34f))

## [1.0.2](https://github.com/sanity-io/visual-editing/compare/preview-url-secret-v1.0.1...preview-url-secret-v1.0.2) (2023-11-16)


### Bug Fixes

* disable stega on verification of url preview secrets ([6426750](https://github.com/sanity-io/visual-editing/commit/64267500b60fe4b0b6c58bcf5e5da9ac7b311f28))

## [1.0.1](https://github.com/sanity-io/visual-editing/compare/preview-url-secret-v1.0.0...preview-url-secret-v1.0.1) (2023-11-16)


### Bug Fixes

* **deps:** update dependency @sanity/client to ^6.8.6 ([#374](https://github.com/sanity-io/visual-editing/issues/374)) ([f62967a](https://github.com/sanity-io/visual-editing/commit/f62967a2068844b358357c7c2254cd1d9228ba6d))

## [1.0.0](https://github.com/sanity-io/visual-editing/compare/preview-url-secret-v0.3.3-pink-lizard...preview-url-secret-v1.0.0) (2023-11-15)


### Features

* production ready release ([#246](https://github.com/sanity-io/visual-editing/issues/246)) ([993c3cc](https://github.com/sanity-io/visual-editing/commit/993c3cc621921971087053950a1dc88fd9e34762))

## [0.3.3-pink-lizard](https://github.com/sanity-io/visual-editing/compare/preview-url-secret-v0.3.2-pink-lizard...preview-url-secret-v0.3.3-pink-lizard) (2023-11-13)


### Bug Fixes

* **deps:** Update dependency @sanity/client to ^6.8.2 ([#356](https://github.com/sanity-io/visual-editing/issues/356)) ([b80dfa5](https://github.com/sanity-io/visual-editing/commit/b80dfa519c9790efdfdc0590ad7eb3f56998ea01))
* **deps:** Update dependency @sanity/client to ^6.8.4 ([5dbbe06](https://github.com/sanity-io/visual-editing/commit/5dbbe062ac1dd71a251e70d15caa1c5d53a505f6))
* **deps:** Update dependency @sanity/client to ^6.8.5 ([#361](https://github.com/sanity-io/visual-editing/issues/361)) ([e8e61c1](https://github.com/sanity-io/visual-editing/commit/e8e61c1a377b2737db60a1c3e42160794b26ad9b))

## [0.3.2-pink-lizard](https://github.com/sanity-io/visual-editing/compare/preview-url-secret-v0.3.1-pink-lizard...preview-url-secret-v0.3.2-pink-lizard) (2023-11-13)


### Bug Fixes

* **deps:** Update dependency @sanity/client to ^6.8.1 ([#351](https://github.com/sanity-io/visual-editing/issues/351)) ([6efe86f](https://github.com/sanity-io/visual-editing/commit/6efe86f7589ae8e0b2e64e1c5b6c439b5ec5292d))

## [0.3.1-pink-lizard](https://github.com/sanity-io/visual-editing/compare/preview-url-secret-v0.3.0-pink-lizard...preview-url-secret-v0.3.1-pink-lizard) (2023-11-11)


### Bug Fixes

* garbage collect expired secrets ([817582b](https://github.com/sanity-io/visual-editing/commit/817582b509d7614162485f71ba38f84e98653157))

## [0.3.0-pink-lizard](https://github.com/sanity-io/visual-editing/compare/preview-url-secret-v0.2.1-pink-lizard...preview-url-secret-v0.3.0-pink-lizard) (2023-11-10)


### Features

* generate secrets on demand ([9b47760](https://github.com/sanity-io/visual-editing/commit/9b477607edc2f3b89e03e0c64c9f7a92687f7c25))


### Bug Fixes

* don't show secret url search params in navbar ([4c684f1](https://github.com/sanity-io/visual-editing/commit/4c684f11c981bd0788cc2a8b5f9fcc4c7e9e9693))
* implement url validation on the api handler side ([ca0c856](https://github.com/sanity-io/visual-editing/commit/ca0c856637e5c00200e02c708e02814319a9e55f))
* keep preview url in sync (figure out cleaning hidden search params later) ([38912e1](https://github.com/sanity-io/visual-editing/commit/38912e17a86f17e0886aac9ae43dc3aa3299a574))
* mark API that's not yet implemented ([53c0a33](https://github.com/sanity-io/visual-editing/commit/53c0a339b02ab6f5e7925740eb7ef888c227e2b6))
* quote query string ([90006be](https://github.com/sanity-io/visual-editing/commit/90006be863b388c688f659eb37dba8bb759a2ee2))

## [0.2.1-pink-lizard](https://github.com/sanity-io/visual-editing/compare/preview-url-secret-v0.2.0-pink-lizard...preview-url-secret-v0.2.1-pink-lizard) (2023-11-10)


### Bug Fixes

* **deps:** update dependency `@sanity/client` to ^6.8.0 ([4e11e0c](https://github.com/sanity-io/visual-editing/commit/4e11e0c1efd01e889c269d6a270b7c761b776fc0))

## [0.2.0-pink-lizard](https://github.com/sanity-io/visual-editing/compare/preview-url-secret-v0.1.0-pink-lizard...preview-url-secret-v0.2.0-pink-lizard) (2023-11-09)


### Features

* add `definePreviewUrl` API ([c141b74](https://github.com/sanity-io/visual-editing/commit/c141b74b61d93623682a679ecf2614f0886f3939))
* first mvp of Draft Mode handling ([e7d49f4](https://github.com/sanity-io/visual-editing/commit/e7d49f4a1f5069252a48d99de86bae5ea148881c))


### Bug Fixes

* add new placeholder export ([fd68482](https://github.com/sanity-io/visual-editing/commit/fd68482ab3cf0b748623566f32aab254f97bf4ca))

## 0.1.0-pink-lizard (2023-11-09)


### Features

* add placeholder package ([89b7dca](https://github.com/sanity-io/visual-editing/commit/89b7dca999671c543d24ade76bc28996c04475bb))
