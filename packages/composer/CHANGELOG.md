# Changelog

## [0.2.1-pink-lizard.0](https://github.com/sanity-io/visual-editing/compare/composer-v0.2.0-pink-lizard.0...composer-v0.2.1-pink-lizard.0) (2023-10-19)


### Bug Fixes

* **deps:** update dependency @sanity/preview-kit to ^3.2.6 ([a0c2f1a](https://github.com/sanity-io/visual-editing/commit/a0c2f1ab9900a8848ec8a96278d008ea4d2f0c8a))
* include `CHANGELOG.md` files in private packages ([9967f1c](https://github.com/sanity-io/visual-editing/commit/9967f1c8edca69737842e1807cf8f9e725fbcd07))

## [0.2.0-pink-lizard.0](https://github.com/sanity-io/visual-editing/compare/composer-v0.1.0-pink-lizard.0...composer-v0.2.0-pink-lizard.0) (2023-10-19)


### Features

* **composer:** navigator toggle ([a320299](https://github.com/sanity-io/visual-editing/commit/a320299c060ad872bd2bfa8cbe93fb903c67646b))


### Bug Fixes

* **composer:** optional components option ([05cfc2f](https://github.com/sanity-io/visual-editing/commit/05cfc2f494f6a1edfda3f2f75c77d3a2ba0cff36))
* **deps:** update dependency @sanity/client to ^6.7.0 ([85d542f](https://github.com/sanity-io/visual-editing/commit/85d542f75888361bebf80ca7c84f6400ae311a63))

## [0.1.0-pink-lizard.0](https://github.com/sanity-io/visual-editing/compare/composer-v0.0.1-pink-lizard.0...composer-v0.1.0-pink-lizard.0) (2023-10-19)


### Features

* add `useLiveMode` hook ([#118](https://github.com/sanity-io/visual-editing/issues/118)) ([6ccea62](https://github.com/sanity-io/visual-editing/commit/6ccea62438d34c07c48f0c42b815912d3c96c788))
* basic e2e event dispatching ([#59](https://github.com/sanity-io/visual-editing/issues/59)) ([4217a69](https://github.com/sanity-io/visual-editing/commit/4217a69f2f01d19f5391960c23dc74b05d6fc19b))
* clamp resizable element to maxWidth ([fa36b58](https://github.com/sanity-io/visual-editing/commit/fa36b589f11a8fd8fa1a488ce1fed411af890fc3))
* common schema ([#50](https://github.com/sanity-io/visual-editing/issues/50)) ([73aa91e](https://github.com/sanity-io/visual-editing/commit/73aa91e09811864b001cb4370fb3f9af6eeb16ba))
* composer routing ([#68](https://github.com/sanity-io/visual-editing/issues/68)) ([053d7e2](https://github.com/sanity-io/visual-editing/commit/053d7e2949ac9f54dee0421e4bc3e28c979c8fb6))
* **composer:** add `devMode` option ([54dcb20](https://github.com/sanity-io/visual-editing/commit/54dcb203a2361217fd623b647305076965873b2b))
* **composer:** add `icon` plugin option ([dd00bcd](https://github.com/sanity-io/visual-editing/commit/dd00bcde6f9ee3eb62e868f3b59395c8b61e3caa))
* **composer:** add `locate` plugin callback ([a62b0dd](https://github.com/sanity-io/visual-editing/commit/a62b0dd703b34a4e05855ffb73175878b9440265))
* **composer:** add `title` plugin option ([1091648](https://github.com/sanity-io/visual-editing/commit/10916487b740fa89bf8346d3e110a2c6085bd0ea))
* **composer:** basic panels ([#48](https://github.com/sanity-io/visual-editing/issues/48)) ([023a733](https://github.com/sanity-io/visual-editing/commit/023a7330f79b851c583c3127f526647fe4fa6b6e))
* **composer:** dev mode features ([e0e8785](https://github.com/sanity-io/visual-editing/commit/e0e87855f5ca08560cf25de9171c80d4646c2205))
* **composer:** navigator ([#138](https://github.com/sanity-io/visual-editing/issues/138)) ([dc8615b](https://github.com/sanity-io/visual-editing/commit/dc8615be53ecddbaac7decc1099c16c4e0eff23b))
* **composer:** print message log from iframe ([cbeeb99](https://github.com/sanity-io/visual-editing/commit/cbeeb9939d6025d13a60614ed299c2d4e1c31260))
* **composer:** render document editor ([#51](https://github.com/sanity-io/visual-editing/issues/51)) ([2d18114](https://github.com/sanity-io/visual-editing/commit/2d18114367e2848c7f8a72c568442180336eff67))
* initialize composer and add it to next app ([cd32a3d](https://github.com/sanity-io/visual-editing/commit/cd32a3d2261e715993b4558ada957fb9e019c813))
* **live-query:** add experimental PostMessage ([#47](https://github.com/sanity-io/visual-editing/issues/47)) ([9196a28](https://github.com/sanity-io/visual-editing/commit/9196a2853065ffdd6dbd93390b9692693cf42d4f))
* overlay toggling ([4918656](https://github.com/sanity-io/visual-editing/commit/4918656fb7d5d979ce831b00e88c8fa66e5f196e))
* support perspective switcher ([20269fb](https://github.com/sanity-io/visual-editing/commit/20269fbc0f6bd6b20665a02b84a547d6c76856c8))
* sync preview location ([e4fe2c9](https://github.com/sanity-io/visual-editing/commit/e4fe2c997bebd9524398af16c3bb7b9edb678566))
* time for `@sanity/nuxt-loader` ([d489596](https://github.com/sanity-io/visual-editing/commit/d489596f2b9df4f14da9f0fddeb5a1c01c346457))


### Bug Fixes

* **composer:** add tooltips ([c813531](https://github.com/sanity-io/visual-editing/commit/c81353185e629d2d566f6d1e341e43b39f279d02))
* **composer:** dispatch navigation message on preview param change ([e195e17](https://github.com/sanity-io/visual-editing/commit/e195e176e0a3fb4655d3bb971f40482d50408fd2))
* **composer:** if `name` is set, then `title` shouldn't be composer ([5988b52](https://github.com/sanity-io/visual-editing/commit/5988b52a0f283808983b197f74d591bdf7c96359))
* **composer:** improve error message UI ([d47b9ee](https://github.com/sanity-io/visual-editing/commit/d47b9eef5e5cce598ad0af58876f567d9f886bd5))
* **composer:** prevent duplicate param state updates ([452b7ec](https://github.com/sanity-io/visual-editing/commit/452b7ec9f91c112a320565189e5e56d378ae4a90))
* **composer:** reset error state when things change ([c8ff863](https://github.com/sanity-io/visual-editing/commit/c8ff863cb738e09407731a81462e3c3185803510))
* **composer:** toggle locations drawer ([1524663](https://github.com/sanity-io/visual-editing/commit/152466372a60781f0e206414fc42ecb55ccd48a0))
* **composer:** use sans serif for location input ([e9f1e92](https://github.com/sanity-io/visual-editing/commit/e9f1e9280b979b127647aa03d87ab6c449626a48))
* **deps:** Update dependency sanity to ^3.18.1 ([#123](https://github.com/sanity-io/visual-editing/issues/123)) ([70fcdc9](https://github.com/sanity-io/visual-editing/commit/70fcdc9c4da07287e449e0f264921c5dfee065e4))
* **deps:** Update dependency sanity to v3.18.0 ([#93](https://github.com/sanity-io/visual-editing/issues/93)) ([405b07f](https://github.com/sanity-io/visual-editing/commit/405b07ff87765a66ff0ef67ca06d5cfffe72b729))
* **deps:** Update sanity monorepo to v3.16.5-pink-lizard.35 ([#49](https://github.com/sanity-io/visual-editing/issues/49)) ([8fa5199](https://github.com/sanity-io/visual-editing/commit/8fa5199a2604fd1f288dca78e6dc052ff294d919))
* document list rendering ([75ef85a](https://github.com/sanity-io/visual-editing/commit/75ef85a1b918da102fa60ca5a2312a9b2e5e3c65))
* initial `@sanity/react-loader` ([726d818](https://github.com/sanity-io/visual-editing/commit/726d818afc5fdd83ac9fd16b5d8603790940571a))
* setup loaders channel ([20971aa](https://github.com/sanity-io/visual-editing/commit/20971aaa38fab192e95a99dd4cbb67ba5d1f86e1))
* support AI assist params ([3d81e1f](https://github.com/sanity-io/visual-editing/commit/3d81e1fb07277ea389fbf4624ee357827280ae27))
* support refresh ([2ef0ac5](https://github.com/sanity-io/visual-editing/commit/2ef0ac5e22d831c35bdc0b42fb25dde537f4114a))
* track if channels are healthy ([4cc24a0](https://github.com/sanity-io/visual-editing/commit/4cc24a08bcfd318f4006d7c8f062d70764e22c65))

## 0.0.1 (2023-09-08)


### Features

* initialize composer and add it to next app ([cd32a3d](https://github.com/sanity-io/visual-editing/commit/cd32a3d2261e715993b4558ada957fb9e019c813))
