/**
 * 迁移 R2 文件: sucards-images → sucards-images-apac
 * 先从 /api/cards 获取已有卡面列表，再逐个搬运
 */
import { execSync } from 'node:child_process'
import { mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

const SOURCE = 'sucards-images'
const TARGET = 'sucards-images-apac'
const tmp = join(tmpdir(), 'r2mig')

function run(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf-8', stdio: 'pipe' })
  } catch { return null }
}

function pad(n) { return String(n).padStart(3, '0') }

async function main() {
  mkdirSync(tmp, { recursive: true })

  // 1. 获取已有卡面列表
  console.log('获取卡面列表...')
  const res = await fetch('https://sucards.pages.dev/api/cards')
  const cards = await res.json()
  const existing = cards.filter(c => c.has_card).map(c => c.card_number)
  console.log(`  找到 ${existing.length} 张有图的卡: ${existing.join(', ')}\n`)

  if (existing.length === 0) {
    console.log('没有需要迁移的卡面。')
    return
  }

  let count = 0

  for (const n of existing) {
    const key = `cards/${pad(n)}.png`
    const file = join(tmp, `${pad(n)}.png`)

    console.log(`[${n}] 搬运 ${key} ...`)
    const getRes = run(`npx wrangler r2 object get ${SOURCE}/${key} --file "${file}"`)
    if (getRes === null) { console.log('  ⚠️ 下载失败，跳过'); continue }

    const putRes = run(`npx wrangler r2 object put ${TARGET}/${key} --file "${file}"`)
    if (putRes === null) { console.log('  ⚠️ 上传失败，跳过'); continue }

    console.log(`  ✅ 完成`)
    count++
  }

  // 清理
  rmSync(tmp, { recursive: true, force: true })
  console.log(`\n迁移完成！共 ${count} 张卡面。`)
}

main().catch(err => { console.error('失败:', err.message); process.exit(1) })
