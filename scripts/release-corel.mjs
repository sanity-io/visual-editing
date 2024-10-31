#!/usr/bin/env zx
import 'zx/globals'

const {packages} = await fs.readJson('./release-please-config.json')
const workspaces = Object.keys(packages)

echo`found ${chalk.blue(workspaces.length)} workspaces to publish canaries for`

const prev = new Map()
const next = new Map()

for (const workspace of workspaces) {
  const {name, version, private: isPrivate} = await fs.readJson(`./${workspace}/package.json`)
  if (!isPrivate) {
    await spinner(`bumping ${chalk.blue(name)} from ${chalk.yellow(version)}`, async () => {
      prev.set(name, version)
      // `pnpm version` is really just an alias for `npm version` atm, so we have to jump through some hoops
      await $`pnpm --filter="${name}" exec pnpm version --no-commit-hooks --no-git-tag-version --preid release prerelease`
      next.set(name, (await fs.readJson(`./${workspace}/package.json`)).version)
    })
    echo`bumped ${chalk.blue(name)} from ${chalk.yellow(prev.get(name))} to ${chalk.green(next.get(name))}`
  }
}

await $`pnpm build --output-logs=errors-only`.pipe(process.stdout)

// If provenance isn't enabled, assume we're running locally and need to confirm before publishing
if (process.env.NPM_CONFIG_PROVENANCE !== 'true') {
  const shouldProceed = await question('Are you sure you want to proceed? (y/n) ')
  if (shouldProceed.toLowerCase() !== 'y' && shouldProceed.toLowerCase() !== 'yes') {
    console.log('Operation cancelled.')
    for (const workspace of workspaces) {
      const {name, ...rest} = await fs.readJson(`./${workspace}/package.json`)
      if (prev.has(name)) {
        await fs.writeJson(`./${workspace}/package.json`, {name, ...rest, version: prev.get(name)})
        await $`prettier --write ./${workspace}/package.json`
      }
    }
    process.exit(0)
  }
}

for (const name of next.keys()) {
  await $`pnpm --filter="${name}" publish --tag release --no-git-checks`.pipe(process.stdout)
}

echo`published canaries for ${chalk.blue(workspaces.length)} workspaces`
