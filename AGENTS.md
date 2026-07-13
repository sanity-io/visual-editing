# AGENTS.md

## Cursor Cloud specific instructions

This is the Sanity **visual-editing-monorepo** (pnpm + Turborepo). Products are publishable libraries in `packages/*`; demo/test apps live in `apps/*` and exercise them against Sanity's hosted Content Lake. Standard commands live in the root `package.json` and each package's `turbo.json` — reference those rather than duplicating.

- **Toolchain:** Node 20.19+ (VM has Node 22 LTS) and pnpm 10.34.1 are preinstalled. The update script runs `pnpm install`.
- **Build packages first:** apps depend on `workspace:*` package builds. Run `pnpm build` (builds `packages/*`, excludes apps) before running apps, or use the wired-up `pnpm dev:*` scripts which build deps + studio, then watch. `pnpm dev` (no target) builds packages then watches everything.
- **Lint / test:** `pnpm lint` and `pnpm test` (Vitest unit + typecheck). Tests need no running services or backend and are the fastest correctness signal.
- **No local backend:** all content comes from Sanity's hosted Content Lake (project `hiomol4a`, defined in `packages/@repo/env/index.ts`). There is no database/container to run locally.
- **Demo apps need secrets:** `apps/next` (:3001), `apps/live-next` (:3009), and `apps/page-builder-demo` (:3005) `throw` at request time without `SANITY_API_READ_TOKEN` (see `apps/*/src/**/sanity.*.ts` and `.env.local` / `.env.example`). `live-next` / `page-builder-demo` also expect `SANITY_API_BROWSER_TOKEN`. The Studio (`apps/studio`, :3333, `sanity dev`) additionally needs a Sanity login (`sanity login` / `SANITY_AUTH_TOKEN`).
- **Running without secrets (self-contained demo):** `pnpm storybook:visual-editing` (Storybook on :6006) renders the `@sanity/visual-editing` "Overlays" stories with clickable edit overlays and needs no token or backend — use it to demonstrate the core overlay product. You can also run it directly from `packages/visual-editing` via `pnpm storybook`.
- The `sanity-extracted-schema` build prints harmless warnings about workspaces declaring different `auth` configs; these are non-fatal.
