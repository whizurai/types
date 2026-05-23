#!/usr/bin/env node
/**
 * Boundary CI checks for @whizurai/types.
 *
 * Enforces:
 *  1. Reserved-word check — product nouns must never appear in exported types.
 *  2. Import-allowlist check — package must only import from zod or node builtins.
 *
 * Run: node scripts/check-boundary.mjs
 * Exits non-zero on new violations; prints offending file:line for each.
 *
 * Pre-existing violations are grandfathered via scripts/boundary-baseline.json.
 * Do NOT add new entries to that file — fix the violation instead.
 *
 * The reserved-word list mirrors the registry in
 * https://github.com/guzzyworld/guzzy-world-payload/blob/main/docs/architecture/never-build.md
 * Keep in sync when adding new product nouns.
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = join(fileURLToPath(import.meta.url), '..', '..')
const srcRoot = join(repoRoot, 'src')
const baselinePath = join(repoRoot, 'scripts', 'boundary-baseline.json')

const RESERVED_WORDS = [
  // Story / direction nouns — product-only concepts
  'motif',
  'beat',
  'arc',
  'vibe',
  'cinematic',
  'cozy',
  'heroic',
  'playful',
  'dramatic',
  'whimsical',
  'emotional',
  'narrative',
  'shotMotif',
  'storyArc',
  'beatTemplate',
  'cameraMove',
  // Editorial nouns
  'editorial',
  'curation',
  'occasion',
  // Pet / consumer-product nouns
  'pet',
  'breed',
  'owner',
]

const ALLOWED_IMPORT_PREFIXES = ['zod', 'node:']
const ALLOWED_RELATIVE_IMPORT = /^\.{1,2}\//

function collectTsFiles(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) collectTsFiles(full, acc)
    else if (entry.endsWith('.ts') || entry.endsWith('.tsx')) acc.push(full)
  }
  return acc
}

function checkReservedWords(file, content) {
  const violations = []
  const lines = content.split('\n')
  lines.forEach((line, idx) => {
    if (line.trimStart().startsWith('//') || line.trimStart().startsWith('*')) return
    for (const word of RESERVED_WORDS) {
      const pattern = new RegExp(`\\b${word}\\b`, 'i')
      if (pattern.test(line)) {
        violations.push({
          kind: 'reserved-word',
          file: relative(repoRoot, file),
          line: idx + 1,
          word: word.toLowerCase(),
          snippet: line.trim(),
        })
      }
    }
  })
  return violations
}

function checkImports(file, content) {
  const violations = []
  const importRegex = /import\s+(?:.*?\s+from\s+)?["']([^"']+)["']/g
  const requireRegex = /require\s*\(\s*["']([^"']+)["']\s*\)/g
  const lines = content.split('\n')
  lines.forEach((line, idx) => {
    const trimmed = line.trim()
    if (trimmed.startsWith('//') || trimmed.startsWith('*')) return
    for (const re of [importRegex, requireRegex]) {
      let m
      while ((m = re.exec(line)) !== null) {
        const spec = m[1]
        if (ALLOWED_RELATIVE_IMPORT.test(spec)) continue
        const allowed = ALLOWED_IMPORT_PREFIXES.some(
          (p) => spec === p || spec.startsWith(`${p}/`),
        )
        if (!allowed) {
          violations.push({
            kind: 'import',
            file: relative(repoRoot, file),
            line: idx + 1,
            import: spec,
          })
        }
      }
    }
  })
  return violations
}

function baselineKey(v) {
  return v.kind === 'reserved-word'
    ? `reserved:${v.file}:${v.line}:${v.word}`
    : `import:${v.file}:${v.line}:${v.import}`
}

function loadBaseline() {
  if (!existsSync(baselinePath)) return new Set()
  const data = JSON.parse(readFileSync(baselinePath, 'utf-8'))
  return new Set(data.exemptions || [])
}

const baseline = loadBaseline()
const files = collectTsFiles(srcRoot)

const allViolations = []
for (const file of files) {
  const content = readFileSync(file, 'utf-8')
  allViolations.push(...checkReservedWords(file, content))
  allViolations.push(...checkImports(file, content))
}

const newViolations = allViolations.filter((v) => !baseline.has(baselineKey(v)))
const baselined = allViolations.length - newViolations.length

const reservedNew = newViolations.filter((v) => v.kind === 'reserved-word')
const importNew = newViolations.filter((v) => v.kind === 'import')

let failed = false

if (reservedNew.length > 0) {
  failed = true
  console.error('\n❌ NEW reserved-word violations (product nouns in contracts):')
  for (const v of reservedNew) {
    console.error(`  ${v.file}:${v.line} — "${v.word}" in: ${v.snippet}`)
  }
  console.error(
    '\nProduct nouns must never appear in @whizurai/types exports.',
  )
  console.error(
    'See: https://github.com/guzzyworld/guzzy-world-payload/blob/main/docs/architecture/never-build.md',
  )
}

if (importNew.length > 0) {
  failed = true
  console.error('\n❌ NEW disallowed imports (only zod + node builtins allowed):')
  for (const v of importNew) {
    console.error(`  ${v.file}:${v.line} — imports "${v.import}"`)
  }
  console.error(
    '\n@whizurai/types must remain a pure contracts package — no runtime deps beyond zod.',
  )
}

if (failed) {
  console.error(`\n(${baselined} pre-existing violations grandfathered via baseline.)`)
  console.error(
    'Do NOT add new baseline entries to make this pass — fix the violation.',
  )
  process.exit(1)
}

console.log(
  `✅ Boundary checks passed (${files.length} files, ${baselined} grandfathered, 0 new violations).`,
)
