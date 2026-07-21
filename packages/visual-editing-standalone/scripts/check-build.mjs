import {readdir, readFile} from 'node:fs/promises'
import {extname, join, relative} from 'node:path'
import {fileURLToPath, pathToFileURL} from 'node:url'

const packageDirectory = fileURLToPath(new URL('..', import.meta.url))
const packageJsonPath = join(packageDirectory, 'package.json')
const distDirectory = join(packageDirectory, 'dist')

async function listFiles(directory) {
  const entries = await readdir(directory, {withFileTypes: true})
  const files = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name)
      return entry.isDirectory() ? listFiles(path) : path
    }),
  )

  return files.flat()
}

const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'))
const runtimeDependencyFields = [
  'bundledDependencies',
  'dependencies',
  'optionalDependencies',
  'peerDependencies',
]

for (const field of runtimeDependencyFields) {
  if (field in packageJson) {
    throw new Error(`Standalone package must not declare ${field}`)
  }
}

const emittedFiles = await listFiles(distDirectory)
const moduleFiles = emittedFiles.filter((file) => file.endsWith('.js') || file.endsWith('.d.ts'))
const errors = []

for (const file of moduleFiles) {
  const source = await readFile(file, 'utf8')
  const moduleSpecifierPattern = /(?:\bfrom\s*|\bimport\s*(?:\(\s*)?)['"]([^'"]+)['"]/gu

  for (const match of source.matchAll(moduleSpecifierPattern)) {
    const specifier = match[1]
    if (!specifier?.startsWith('.')) {
      errors.push(`${relative(packageDirectory, file)} imports "${specifier}"`)
    }
  }

  if (file.endsWith('.js') && /\brequire\s*\(/u.test(source)) {
    errors.push(`${relative(packageDirectory, file)} contains a CommonJS require() call`)
  }
}

const commonJsFiles = emittedFiles.filter((file) => extname(file) === '.cjs')
if (commonJsFiles.length > 0) {
  errors.push(
    ...commonJsFiles.map((file) => `${relative(packageDirectory, file)} is a CommonJS output`),
  )
}

if (errors.length > 0) {
  throw new Error(`Standalone build is not self-contained ESM:\n${errors.join('\n')}`)
}

const expectedExports = {
  'dist/create-data-attribute/index.js': ['createDataAttribute'],
  'dist/enable-visual-editing/index.js': ['enableVisualEditing'],
  'dist/index.js': ['createDataAttribute', 'enableVisualEditing'],
}

for (const [file, expected] of Object.entries(expectedExports)) {
  const module = await import(pathToFileURL(join(packageDirectory, file)).href)
  const actual = Object.keys(module).sort()

  if (actual.join() !== expected.join()) {
    throw new Error(`${file} exports ${actual.join(', ')}, expected ${expected.join(', ')}`)
  }
}

console.log(`Verified ${moduleFiles.length} self-contained ESM build files`)
