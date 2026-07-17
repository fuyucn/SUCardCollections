/**
 * 图片优化脚本
 * - 输入: public/images/cards/back.png (原图)
 * - 输出: public/images/cards/back-thumb.webp (预览缩略图, 400px 宽)
 *
 * 用法: node scripts/optimize-images.mjs
 */

import sharp from 'sharp'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const tasks = [
  {
    // 卡背缩略图 — 预览用 400px WebP
    input: path.join(root, 'public/images/cards/back.png'),
    output: path.join(root, 'public/images/cards/back-thumb.webp'),
    width: 400,
    quality: 80,
  },
]

async function main() {
  for (const task of tasks) {
    console.log(`Processing: ${task.input}`)
    if (!fs.existsSync(task.input)) {
      console.warn(`  ⚠ Input not found, skipping`)
      continue
    }

    const originalSize = fs.statSync(task.input).size

    await sharp(task.input)
      .resize(task.width, undefined, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: task.quality })
      .toFile(task.output)

    const outputSize = fs.statSync(task.output).size
    const reduction = ((1 - outputSize / originalSize) * 100).toFixed(0)
    console.log(`  ✓ ${path.basename(task.output)}: ${(originalSize / 1024 / 1024).toFixed(1)}MB → ${(outputSize / 1024).toFixed(0)}KB (减少 ${reduction}%)`)
  }
  console.log('\nDone.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
