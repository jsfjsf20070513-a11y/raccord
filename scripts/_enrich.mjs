// 一次性脚本:给词库每个词补 exampleZh(例句中文)+ note(中文讲解)。
// 读 frenchVocabulary.js → 分批调用线上 Worker /api/chat(Gemini)→ 写 scripts/_enrich.json。
// 可断点续跑(已生成的 id 跳过)。限速避开 Worker(30/min)+ Gemini 免费层 RPM。
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { frenchVocabulary } from '../src/data/frenchVocabulary.js'

const ENDPOINT = 'https://rucmathclass.com/api/chat'
const OUT = 'scripts/_enrich.json'
const BATCH = 40
const PACE_MS = 3500
const MAX_BATCHES = Number(process.env.MAX_BATCHES || 0) || Infinity

const done = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : {}
const todo = frenchVocabulary.filter((w) => !done[w.id])
console.log(`总 ${frenchVocabulary.length} · 已完成 ${Object.keys(done).length} · 待办 ${todo.length}`)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function parseJsonLoose(text) {
  let t = `${text}`.trim()
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fence) t = fence[1].trim()
  const start = t.indexOf('[')
  const end = t.lastIndexOf(']')
  if (start >= 0 && end > start) t = t.slice(start, end + 1)
  return JSON.parse(t)
}

async function callBatch(batch) {
  const list = batch.map((w) => ({ id: w.id, french: w.french, chinese: w.chinese, example: w.example || '' }))
  const prompt = `Tu es lexicographe FR→ZH. Pour CHAQUE entrée ci-dessous, renvoie:
- "exampleZh": la traduction chinoise (中文) naturelle de "example" (si example vide, "").
- "note": un 讲解 en CHINOIS très concis (≤40字): usage/搭配/记忆/词根/近义辨析, utile pour un élève chinois.
Entrées (JSON):
${JSON.stringify(list)}
RENVOIE UNIQUEMENT un tableau JSON [{"id","exampleZh","note"}], rien d'autre, pas de prose, pas de \`\`\`.`

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] }),
  })
  if (res.status === 429) throw new Error('429')
  if (!res.ok) throw new Error(`http ${res.status}`)
  const data = await res.json()
  return parseJsonLoose(data.text || '')
}

// 产出比守护:坏窗口(连续跳过 N 批)早退,别在 502/429 上空转。
const MAX_SKIPS = Number(process.env.MAX_SKIPS || 2)
let i = 0
let fails = 0
let runBatches = 0
let skips = 0
while (i < todo.length && runBatches < MAX_BATCHES) {
  const batch = todo.slice(i, i + BATCH)
  runBatches += 1
  try {
    const rows = await callBatch(batch)
    let got = 0
    for (const r of rows || []) {
      if (r && r.id) { done[r.id] = { exampleZh: `${r.exampleZh || ''}`.trim(), note: `${r.note || ''}`.trim() }; got += 1 }
    }
    writeFileSync(OUT, JSON.stringify(done))
    console.log(`批 ${i / BATCH + 1}: +${got}  (累计 ${Object.keys(done).length}/${frenchVocabulary.length})`)
    i += BATCH
    fails = 0
    skips = 0
    await sleep(PACE_MS)
  } catch (e) {
    fails += 1
    const wait = e.message === '429' ? 30000 : 8000 * fails
    console.log(`批 ${i / BATCH + 1} 失败(${e.message}),等 ${wait}ms 重试 [${fails}]`)
    if (fails > 6) {
      console.log('连续失败过多,这批跳过')
      i += BATCH
      fails = 0
      skips += 1
      if (skips >= MAX_SKIPS) { console.log(`坏窗口(跳过 ${skips} 批),早退,等下一轮`); break }
    }
    await sleep(wait)
  }
}
console.log(`完成。共 ${Object.keys(done).length} 条 → ${OUT}`)
