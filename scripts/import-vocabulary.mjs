#!/usr/bin/env node
// Batch-import a CSV/JSON word list into the French vocabulary deck.
//
// Usage:
//   node scripts/import-vocabulary.mjs <input.csv|input.json> [--out src/data/frenchVocabulary.js]
//
// Prints a validation report (accepted / rejected-with-reasons / duplicates).
// With --out it writes the validated deck as a frenchVocabulary.js module;
// without --out it is a dry run (report only). Validation reuses the same
// cleanFrenchWord rules the trainer enforces (noun→gender, verb→conjugation).

import { readFile, writeFile } from 'node:fs/promises'
import { argv, exit } from 'node:process'
import { importVocabulary, toDataModuleSource } from '../src/lib/vocabularyImport.js'

function parseArgs(args) {
  const positional = []
  let out = null
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === '--out') {
      out = args[i + 1]
      i += 1
    } else {
      positional.push(args[i])
    }
  }
  return { input: positional[0], out }
}

const { input, out } = parseArgs(argv.slice(2))

if (!input) {
  console.error('Usage: node scripts/import-vocabulary.mjs <input.csv|input.json> [--out <file>]')
  exit(1)
}

const text = await readFile(input, 'utf8')
const format = input.toLowerCase().endsWith('.json') ? 'json' : input.toLowerCase().endsWith('.csv') ? 'csv' : undefined
const { words, report } = importVocabulary(text, { format })

console.log(`\n— 导入报告 (${input}) —`)
console.log(`  读入   : ${report.total}`)
console.log(`  ✓ 接受 : ${report.accepted}`)
console.log(`  ✗ 拒绝 : ${report.rejected.length}`)
console.log(`  ⊘ 重复 : ${report.duplicates.length}`)

if (report.rejected.length) {
  console.log('\n  被拒条目:')
  for (const r of report.rejected) {
    console.log(`    [行 ${r.index + 1}] ${r.french || '(无 french)'} — ${r.errors.join('; ')}`)
  }
}
if (report.duplicates.length) {
  console.log('\n  重复 id(已跳过):')
  for (const d of report.duplicates) {
    console.log(`    [行 ${d.index + 1}] ${d.id}`)
  }
}

if (out) {
  await writeFile(out, toDataModuleSource(words), 'utf8')
  console.log(`\n  已写出 ${words.length} 条 → ${out}`)
} else {
  console.log('\n  (dry run — 加 --out <file> 才会写文件)')
}
console.log('')

// Non-zero exit if nothing was accepted, so CI/automation can catch a bad file.
exit(report.accepted === 0 ? 2 : 0)
