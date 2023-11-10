<!-- markdownlint-disable --><!-- textlint-disable -->

# 📓 Changelog

All notable changes to this project will be documented in this file. See
[Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.3.1-pink-lizard](https://github.com/sanity-io/visual-editing/compare/overlays-v2.3.0-pink-lizard...overlays-v2.3.1-pink-lizard) (2023-11-10)


### Bug Fixes

* **presentation:** prevent iframe from taking focus ([fbd02fd](https://github.com/sanity-io/visual-editing/commit/fbd02fd3b83774546c017a84cf8c444eff5dfe4f))
* **presentation:** prevent scrolling when array items close ([da2ad22](https://github.com/sanity-io/visual-editing/commit/da2ad22c7e825cebdff0dbfa374b65ca3a50e04c))
* remove initial url sender ([badda86](https://github.com/sanity-io/visual-editing/commit/badda8677af485467f469ef39f710566ba2908b4))
* send initial URL on load ([3caf2e3](https://github.com/sanity-io/visual-editing/commit/3caf2e35511e4bfd7275131f2301b1f32742e70b))
* **types:** add `HistoryAdapterNavigate` exported type ([7e8340f](https://github.com/sanity-io/visual-editing/commit/7e8340f0b5313885b4205bad60f3b2db62f79309))

## [2.3.0-pink-lizard](https://github.com/sanity-io/visual-editing/compare/overlays-v2.2.1-pink-lizard...overlays-v2.3.0-pink-lizard) (2023-11-09)


### Features

* **overlays:** toggle overlay using mod key ([#228](https://github.com/sanity-io/visual-editing/issues/228)) ([60484e1](https://github.com/sanity-io/visual-editing/commit/60484e1458fdc9f85071cdbca2afc0978fae8041))


### Bug Fixes

* **presentation:** complete keyboard implementation ([a931b1b](https://github.com/sanity-io/visual-editing/commit/a931b1b68cf85a17dd1ab8010445313c4d75539a))

## [2.2.1-pink-lizard](https://github.com/sanity-io/visual-editing/compare/overlays-v2.2.0-pink-lizard...overlays-v2.2.1-pink-lizard) (2023-11-08)


### Bug Fixes

* use `studioPath` utils from `@sanity/client/csm` ([a804364](https://github.com/sanity-io/visual-editing/commit/a80436410083ae88f6dc46a259ae3a08a7f4b59f))

## [2.2.0-pink-lizard](https://github.com/sanity-io/visual-editing/compare/overlays-v2.1.2-pink-lizard...overlays-v2.2.0-pink-lizard) (2023-11-08)


### ⚠ BREAKING CHANGES

* lazy load live mode ([#281](https://github.com/sanity-io/visual-editing/issues/281))
* renamed `studioUrl` to `allowStudioOrigin`to clarify it's CORS related

### Bug Fixes

* lazy load live mode ([#281](https://github.com/sanity-io/visual-editing/issues/281)) ([e52991c](https://github.com/sanity-io/visual-editing/commit/e52991cc974df76647c4ede51de16527c14e6c10))
* renamed `studioUrl` to `allowStudioOrigin`to clarify it's CORS related ([589a7c2](https://github.com/sanity-io/visual-editing/commit/589a7c29ef61bb53f249847b4d5b9ae78ad252f2))

## [2.1.2-pink-lizard](https://github.com/sanity-io/visual-editing/compare/overlays-v2.1.1-pink-lizard...overlays-v2.1.2-pink-lizard) (2023-11-07)


### Bug Fixes

* **deps:** Update dependency @sanity/ui to ^1.9.0 ([#274](https://github.com/sanity-io/visual-editing/issues/274)) ([4b971e3](https://github.com/sanity-io/visual-editing/commit/4b971e38c480322b4041206b5fd6378b01797ca4))

## [2.1.1-pink-lizard](https://github.com/sanity-io/visual-editing/compare/overlays-v2.1.0-pink-lizard...overlays-v2.1.1-pink-lizard) (2023-11-04)


### Bug Fixes

* scroll into view if needed ([dfbbdbb](https://github.com/sanity-io/visual-editing/commit/dfbbdbb38ea9220cc820441c5e8f7296c44922fb))

## [2.1.0-pink-lizard](https://github.com/sanity-io/visual-editing/compare/overlays-v2.0.2-pink-lizard...overlays-v2.1.0-pink-lizard) (2023-11-04)


### Features

* use the new `@sanity/client/stega` features ([#252](https://github.com/sanity-io/visual-editing/issues/252)) ([fa08bb2](https://github.com/sanity-io/visual-editing/commit/fa08bb24e6413bfa49adb79df256217e06ed0844))


### Bug Fixes

* handle stega nodes in a way that supports focus ([#254](https://github.com/sanity-io/visual-editing/issues/254)) ([dce801f](https://github.com/sanity-io/visual-editing/commit/dce801f3b76e6e2bb0597345b5deacc2038e6fec))

## [2.0.2-pink-lizard](https://github.com/sanity-io/visual-editing/compare/overlays-v2.0.1-pink-lizard...overlays-v2.0.2-pink-lizard) (2023-11-03)


### Bug Fixes

* **overlays:** flash overlays when mounting ([6a9a86d](https://github.com/sanity-io/visual-editing/commit/6a9a86d9eca784dff1ff55686b9b91ca9203f6a9))

## [2.0.1-pink-lizard](https://github.com/sanity-io/visual-editing/compare/overlays-v2.0.0-pink-lizard...overlays-v2.0.1-pink-lizard) (2023-11-02)


### Bug Fixes

* attempt bundling `@sanity/ui` and `styled-components` for hydrogen compat ([b39f58a](https://github.com/sanity-io/visual-editing/commit/b39f58a33e6114be37d69d852b40ff35397d8591))
* **CHANGELOG:** restore continuity ([c9f19cd](https://github.com/sanity-io/visual-editing/commit/c9f19cd7d8be297b99f7feb9c678b34822d10c8b))
* don't bundle `uuid` ([6e11ca5](https://github.com/sanity-io/visual-editing/commit/6e11ca552cc05dc37295900c5aab511ab7b6eef9))

## [2.0.0-pink-lizard](https://github.com/sanity-io/visual-editing/compare/overlays-v0.1.16-pink-lizard...overlays-v2.0.0-pink-lizard) (2023-11-02)


### Bug Fixes

* **README:** add badges and links ([0fcf516](https://github.com/sanity-io/visual-editing/commit/0fcf516fb0a920c01cb4a153863d256e39395024))

## [0.1.16-pink-lizard](https://github.com/sanity-io/visual-editing/compare/overlays-v0.1.15-pink-lizard...overlays-v0.1.16-pink-lizard) (2023-11-02)


### Bug Fixes

* bundle `valibot` ([6b07f06](https://github.com/sanity-io/visual-editing/commit/6b07f0629d1e70fcce86b22f1a3f8258f1f833c7))
* move peer deps to regular deps ([91489dc](https://github.com/sanity-io/visual-editing/commit/91489dc486f209cdaf618cffb2f0e331b2d9753a))
* remove unused `@sanity/icons` package ([09c1954](https://github.com/sanity-io/visual-editing/commit/09c195409525fff03563ce973b36b14055d49fb9))
* remove unused dep `history` ([9fb2447](https://github.com/sanity-io/visual-editing/commit/9fb24478abb0bddacd0fbe369ec4956cfa1aaa09))

## [0.1.15-pink-lizard](https://github.com/sanity-io/visual-editing/compare/overlays-v0.1.14-pink-lizard...overlays-v0.1.15-pink-lizard) (2023-11-02)


### Bug Fixes

* remove `sanity` peer dep ([30ff225](https://github.com/sanity-io/visual-editing/commit/30ff225255b587e92e020bca5cfda03f5577852b))
* remove unused `nanoid` dependency ([142b3dd](https://github.com/sanity-io/visual-editing/commit/142b3ddf9f30b0a7ab89471144a9bf091c31863f))

## [0.1.14-pink-lizard](https://github.com/sanity-io/visual-editing/compare/overlays-v0.1.13-pink-lizard...overlays-v0.1.14-pink-lizard) (2023-11-02)


### Bug Fixes

* **deps:** pin dependencies ([#239](https://github.com/sanity-io/visual-editing/issues/239)) ([e1583b9](https://github.com/sanity-io/visual-editing/commit/e1583b99eb45342ffbddb68c1af66b33bc9a25d1))
* use the same path utils everywhere ([a437719](https://github.com/sanity-io/visual-editing/commit/a4377194fdcaefddb3f199650aeb87a6989b0694))

## [0.1.13-pink-lizard](https://github.com/sanity-io/visual-editing/compare/overlays-v0.1.12-pink-lizard...overlays-v0.1.13-pink-lizard) (2023-11-02)


### Bug Fixes

* always bundle private packages ([6be3f74](https://github.com/sanity-io/visual-editing/commit/6be3f7409216c699667d6ac400b4ce3b3a426679))
* **deps:** Update sanity monorepo to v3.18.2-pink-lizard.172 ([#233](https://github.com/sanity-io/visual-editing/issues/233)) ([c5e6c5d](https://github.com/sanity-io/visual-editing/commit/c5e6c5d48f6d1c6b17d97e3845e3da751aef9918))
* load src directly ([94308f0](https://github.com/sanity-io/visual-editing/commit/94308f0ba815d89347c7201eb759cc0ba6e2bbf7))
* move `@sanity/csm` into `visual-editing-helpers` ([257a4ad](https://github.com/sanity-io/visual-editing/commit/257a4adf64dcd74cbf435b883995c6f5b8730c25))
* **overlays:** improve element detection in mutation handler ([eda5fbd](https://github.com/sanity-io/visual-editing/commit/eda5fbdcfb0d510569aab42a1233679a5ef60b07))
* prepare release ([f2ce9cb](https://github.com/sanity-io/visual-editing/commit/f2ce9cb4046df2cb7581e66fcad3a5c0631778ae))

## [0.1.12-pink-lizard](https://github.com/sanity-io/visual-editing/compare/overlays-v0.1.11-pink-lizard...overlays-v0.1.12-pink-lizard) (2023-10-31)


### Bug Fixes

* **deps:** Update dependency valibot to ^0.20.0 ([#211](https://github.com/sanity-io/visual-editing/issues/211)) ([8fe3fc1](https://github.com/sanity-io/visual-editing/commit/8fe3fc170533bac3e223c0a4885aa0656c454c2f))

## [0.1.11-pink-lizard](https://github.com/sanity-io/visual-editing/compare/overlays-v0.1.10-pink-lizard...overlays-v0.1.11-pink-lizard) (2023-10-27)


### Bug Fixes

* **deps:** Update sanity monorepo to v3.18.2-pink-lizard.162 ([#197](https://github.com/sanity-io/visual-editing/issues/197)) ([6d962b1](https://github.com/sanity-io/visual-editing/commit/6d962b15f5f876c91cfd8df1856d4ffd8f05d83c))
* **refactor:** composer to pages ([#202](https://github.com/sanity-io/visual-editing/issues/202)) ([e46f475](https://github.com/sanity-io/visual-editing/commit/e46f475c50438339f5c95ccf3930f9d16c43dc4b))

## [0.1.10-pink-lizard](https://github.com/sanity-io/visual-editing/compare/overlays-v0.1.9-pink-lizard...overlays-v0.1.10-pink-lizard) (2023-10-25)


### Bug Fixes

* **deps:** upgrade `@sanity/pkg-utils` ([9236c86](https://github.com/sanity-io/visual-editing/commit/9236c86fd37a2e4dff4d5a8142846fc2a96bc538))

## [0.1.9-pink-lizard](https://github.com/sanity-io/visual-editing/compare/overlays-v0.1.8-pink-lizard...overlays-v0.1.9-pink-lizard) (2023-10-24)


### Bug Fixes

* temp disable minify for debugging ([93265ae](https://github.com/sanity-io/visual-editing/commit/93265ae870ec204a2753665a3e435a573ab5d862))

## [0.1.8-pink-lizard](https://github.com/sanity-io/visual-editing/compare/overlays-v0.1.7-pink-lizard...overlays-v0.1.8-pink-lizard) (2023-10-24)


### Bug Fixes

* channels improvements ([#180](https://github.com/sanity-io/visual-editing/issues/180)) ([182cb48](https://github.com/sanity-io/visual-editing/commit/182cb489efb6e5413303fa60d33e8b6c012a0cd3))

## [0.1.7-pink-lizard](https://github.com/sanity-io/visual-editing/compare/overlays-v0.1.6-pink-lizard...overlays-v0.1.7-pink-lizard) (2023-10-24)


### Bug Fixes

* **overlays:** initialise observers on activate method ([475b4bf](https://github.com/sanity-io/visual-editing/commit/475b4bf22c6dcd3b8c00263c1978aa1af3edf7f0))

## [0.1.6-pink-lizard](https://github.com/sanity-io/visual-editing/compare/overlays-v0.1.5-pink-lizard...overlays-v0.1.6-pink-lizard) (2023-10-23)


### Bug Fixes

* disable minification to ease debugging ([666f8e0](https://github.com/sanity-io/visual-editing/commit/666f8e07565a566291c7a19b7dfe65a12aed49a5))

## [0.1.5-pink-lizard](https://github.com/sanity-io/visual-editing/compare/overlays-v0.1.4-pink-lizard...overlays-v0.1.5-pink-lizard) (2023-10-23)


### Bug Fixes

* generate typings from bundled packages ([8201fa7](https://github.com/sanity-io/visual-editing/commit/8201fa7895c8511b44c7a7344d29a183ef2cf87b))

## [0.1.4-pink-lizard](https://github.com/sanity-io/visual-editing/compare/overlays-v0.1.3-pink-lizard...overlays-v0.1.4-pink-lizard) (2023-10-23)


### Bug Fixes

* **deps:** Update dependency @sanity/ui to ^1.8.3 ([#171](https://github.com/sanity-io/visual-editing/issues/171)) ([7612ac4](https://github.com/sanity-io/visual-editing/commit/7612ac4799468f3f15f0ea66e6f09902b11dfb80))
* remove debug console loggers ([84f4b1d](https://github.com/sanity-io/visual-editing/commit/84f4b1d06196161e94aa2333fbf5f9cbef0cc51c))

## [0.1.3-pink-lizard](https://github.com/sanity-io/visual-editing/compare/overlays-v0.1.2-pink-lizard...overlays-v0.1.3-pink-lizard) (2023-10-23)


### Bug Fixes

* **deps:** update sanity monorepo ([#166](https://github.com/sanity-io/visual-editing/issues/166)) ([2f6232f](https://github.com/sanity-io/visual-editing/commit/2f6232fb3384bb1ad29273434e54659b344d6e49))
* **pink-lizard:** remove unnecessary suffix ([c7409aa](https://github.com/sanity-io/visual-editing/commit/c7409aa698a5f6e332b05537441efd0df8d33b95))

## [0.1.2-pink-lizard.0](https://github.com/sanity-io/visual-editing/compare/overlays-v0.1.1-pink-lizard.0...overlays-v0.1.2-pink-lizard.0) (2023-10-19)


### Bug Fixes

* **overlays:** calculate rect on element scroll ([70101f8](https://github.com/sanity-io/visual-editing/commit/70101f8aec06f75a9730b3308c27c927ad4fde35))

## [0.1.1-pink-lizard.0](https://github.com/sanity-io/visual-editing/compare/overlays-v0.1.0-pink-lizard.0...overlays-v0.1.1-pink-lizard.0) (2023-10-19)


### Bug Fixes

* include `CHANGELOG.md` files in private packages ([9967f1c](https://github.com/sanity-io/visual-editing/commit/9967f1c8edca69737842e1807cf8f9e725fbcd07))

## [1.0.6](https://github.com/sanity-io/overlays/compare/v1.0.5...v1.0.6) (2023-09-12)

### Bug Fixes

- overlays not always rendering as top item or clickable ([#32](https://github.com/sanity-io/overlays/issues/32)) ([8d905a1](https://github.com/sanity-io/overlays/commit/8d905a1b25db6bb73791f58b4a157cc80535fd2e))

## [1.0.5](https://github.com/sanity-io/overlays/compare/v1.0.4...v1.0.5) (2023-09-05)

### Bug Fixes

- **deps:** update dependency @floating-ui/react-dom to ^2.0.2 ([#12](https://github.com/sanity-io/overlays/issues/12)) ([0132187](https://github.com/sanity-io/overlays/commit/01321871cf72e6531d4ae11a99facdb8dad86a08))
- **deps:** Update dependency @sanity/ui to ^1.8.2 ([#13](https://github.com/sanity-io/overlays/issues/13)) ([2c0a38c](https://github.com/sanity-io/overlays/commit/2c0a38cf72d1567db13a4ecd83d97efc4dd958a1))
- **deps:** Update dependency react-intersection-observer to ^9.5.2 ([#14](https://github.com/sanity-io/overlays/issues/14)) ([ccf55e7](https://github.com/sanity-io/overlays/commit/ccf55e799eaf7ce9b78ce41778ebc1fc3e7e5070))
- **deps:** update dependency styled-components to ^5.3.11 ([#15](https://github.com/sanity-io/overlays/issues/15)) ([532f436](https://github.com/sanity-io/overlays/commit/532f436f91994ae55f1ede24b23d295a58a24c72))
- prevent multiple instantiations ([#28](https://github.com/sanity-io/overlays/issues/28)) ([6f6e8ee](https://github.com/sanity-io/overlays/commit/6f6e8ee870224976183b5b24e40aeaadd54f83db))
- reenable mutationObserver cleanup ([#27](https://github.com/sanity-io/overlays/issues/27)) ([c634dbf](https://github.com/sanity-io/overlays/commit/c634dbfc616554f249ac31020c6a3d404d3e010a))

## [1.0.4](https://github.com/sanity-io/overlays/compare/v1.0.3...v1.0.4) (2023-09-04)

### Bug Fixes

- add `node.module` condition ([0625af8](https://github.com/sanity-io/overlays/commit/0625af845bd2db73862219a45018ee92faef071a))
- remove `zod` import ([df06ab0](https://github.com/sanity-io/overlays/commit/df06ab078542c9779bb940379a9b0cab29e090bf))

## [1.0.3](https://github.com/sanity-io/overlays/compare/v1.0.2...v1.0.3) (2023-07-20)

### Bug Fixes

- **deps:** use @vercel/stega 0.1.0 ([0f26889](https://github.com/sanity-io/overlays/commit/0f268897eeabc67476f272a3fb586389852b2776))

## [1.0.2](https://github.com/sanity-io/overlays/compare/v1.0.1...v1.0.2) (2023-07-13)

### Bug Fixes

- **deps:** update non-major ([#3](https://github.com/sanity-io/overlays/issues/3)) ([cc9251b](https://github.com/sanity-io/overlays/commit/cc9251b87332c0b67084882c9526c2a09da54768))
- prevent opening edit links twice ([f60c29e](https://github.com/sanity-io/overlays/commit/f60c29e1cf6ff78c293fa43f1fec4f6775a24f21))

## [1.0.1](https://github.com/sanity-io/overlays/compare/v1.0.0...v1.0.1) (2023-07-05)

### Bug Fixes

- **docs:** visual editing doc link ([ee97f2b](https://github.com/sanity-io/overlays/commit/ee97f2b5fa859b296e5e301939fd2e83e150a4a1))

## 1.0.0 (2023-07-05)

### Features

- initial version ([8af1090](https://github.com/sanity-io/overlays/commit/8af109050cfefaa7d19b1809b73822a0f021cc57))
