/**
 * 图片优化脚本
 * 1. 本地: back.png → back-thumb.webp
 * 2. R2:  从 API 拉取卡面 PNG → 压缩 → wrangler 上传到 cards/thumb/
 *
 * 用法: node scripts/optimize-images.mjs
 * 可选环境变量: CARDS_API_URL (默认 https://sucards.pages.dev)
 */

import sharp from 'sharp'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const tmpDir = path.join(root, '.tmp')

const API_BASE = process.env.CARDS_API_URL || 'https://sucards.pages.dev'
const BUCKET = 'sucards-images'
const THUMB_WIDTH = 400
const THUMB_QUALITY = 80

function pad(n) {
  return String(n).padStart(3, '0')
}

async function main() {
  // ══════════════════════════════════════════
  //  Part 1: Local back card thumbnail
  // ══════════════════════════════════════════
  console.log('═'.repeat(50))
  console.log('Local: Card Back')
  console.log('═'.repeat(50))

  const backInput = path.join(root, 'public/images/cards/back.png')
  const backOutput = path.join(root, 'public/images/cards/back-thumb.webp')

  if (fs.existsSync(backInput)) {
    const originalSize = fs.statSync(backInput).size
    await sharp(backInput)
      .resize(THUMB_WIDTH, undefined, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: THUMB_QUALITY })
      .toFile(backOutput)
    const outputSize = fs.statSync(backOutput).size
    const pct = ((1 - outputSize / originalSize) * 100).toFixed(0)
    console.log(`  ✓ back-thumb.webp: ${(originalSize / 1024 / 1024).toFixed(1)}MB → ${(outputSize / 1024).toFixed(0)}KB (减少 ${pct}%)`)
  } else {
    console.warn('  ⚠ back.png not found, skipping')
  }

  // ══════════════════════════════════════════
  //  Part 2: R2 card front thumbnails
  // ══════════════════════════════════════════
  console.log('\n' + '═'.repeat(50))
  console.log('R2: Card Front Thumbnails')
  console.log('═'.repeat(50))

  // Discover which cards exist in R2
  let existingCards = []
  try {
    console.log(`  Fetching card list from ${API_BASE}/api/cards ...`)
    const res = await fetch(`${API_BASE}/api/cards`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const cards = await res.json()
    existingCards = cards.filter(c => c.has_card).map(c => c.card_number)
    if (existingCards.length === 0) {
      console.log('  No card images in R2 yet, skipping')
      return
    }
    console.log(`  Found ${existingCards.length} cards: #${existingCards[0]} ~ #${existingCards[existingCards.length - 1]}`)
  } catch (err) {
    console.warn(`  ⚠ Cannot reach API: ${err.message}`)
    console.warn('  Skipping R2 thumbnails (deploy first, then run again)')
    console.log('\nDone.')
    return
  }

  // Process each card
  fs.mkdirSync(tmpDir, { recursive: true })

  let success = 0
  let skipped = 0
  let failed = 0

  for (const cardNum of existingCards) {
    const num = pad(cardNum)
    const tmpFile = path.join(tmpDir, `${num}.webp`)

    try {
      // 1. Fetch full-size PNG from API
      process.stdout.write(`  [${num}] `)
      const imgRes = await fetch(`${API_BASE}/api/images/${num}.png`)
      if (!imgRes.ok) {
        console.warn(`HTTP ${imgRes.status}, skipping`)
        skipped++
        continue
      }
      const pngBuffer = Buffer.from(await imgRes.arrayBuffer())

      // 2. Resize with sharp
      const thumbBuffer = await sharp(pngBuffer)
        .resize(THUMB_WIDTH, undefined, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: THUMB_QUALITY })
        .toBuffer()

      // 3. Write temp file & upload via wrangler
      fs.writeFileSync(tmpFile, thumbBuffer)
      execSync(
        `npx wrangler r2 object put ${BUCKET}/cards/thumb/${num}.webp --file ${tmpFile}`,
        { cwd: root, stdio: 'pipe' }
      )

      const pct = ((1 - thumbBuffer.length / pngBuffer.length) * 100).toFixed(0)
      console.log(`✓ ${num}.webp: ${(pngBuffer.length / 1024).toFixed(0)}KB → ${(thumbBuffer.length / 1024).toFixed(0)}KB (${pct}%)`)

      // Clean up temp
      fs.unlinkSync(tmpFile)
      success++
    } catch (err) {
      console.error(`✗ ${err.message}`)
      failed++
      try { fs.unlinkSync(tmpFile) } catch {}
    }

    // Small delay between uploads
    await new Promise(r => setTimeout(r, 200))
  }

  // Clean up temp dir
  try {
    const remaining = fs.readdirSync(tmpDir)
    if (remaining.length === 0) fs.rmdirSync(tmpDir)
  } catch {}

  const summary = [`✓ ${success}`]
  if (skipped > 0) summary.push(`⚠ ${skipped} skipped`)
  if (failed > 0) summary.push(`✗ ${failed} failed`)
  console.log(`\n  ${summary.join('  ')}`)
  console.log('\nDone.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
