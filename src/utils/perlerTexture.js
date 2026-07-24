import * as THREE from 'three'

/**
 * 从图片生成拼豆风格的 Canvas 纹理
 * 采样图片像素 → 以彩色小圆珠排列在深色背景上 → 返回 Three.js CanvasTexture
 *
 * @param {string}  imageUrl  图片路径
 * @param {number}  cols      水平珠子数（默认 20）
 * @param {number}  rows      垂直珠子数（默认 28）
 * @returns {Promise<THREE.CanvasTexture | null>}
 */
export async function createPerlerTexture(imageUrl, cols = 20, rows = 28) {
  const img = await loadImage(imageUrl)
  if (!img) return null

  const beadSize = 14      // 珠子直径 px
  const gap = 3            // 珠子间距 px
  const pad = 8            // 边距

  const w = cols * (beadSize + gap) - gap + pad * 2
  const h = rows * (beadSize + gap) - gap + pad * 2

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')

  // 深色底板
  ctx.fillStyle = '#18181b'
  ctx.fillRect(0, 0, w, h)

  // 低分辨率采样原图
  const sampleCanvas = document.createElement('canvas')
  sampleCanvas.width = cols
  sampleCanvas.height = rows
  const sCtx = sampleCanvas.getContext('2d')
  sCtx.drawImage(img, 0, 0, cols, rows)
  const data = sCtx.getImageData(0, 0, cols, rows).data

  // 逐像素画圆珠
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const i = (row * cols + col) * 4
      const [rr, gg, bb] = [data[i], data[i + 1], data[i + 2]]

      // 跳过接近黑色/透明的珠子（保留底板）
      if (rr < 30 && gg < 30 && bb < 30) continue

      const cx = pad + col * (beadSize + gap) + beadSize / 2
      const cy = pad + row * (beadSize + gap) + beadSize / 2
      const r = beadSize / 2

      // 底阴影
      ctx.beginPath()
      ctx.arc(cx + 1, cy + 1, r, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(0,0,0,0.35)'
      ctx.fill()

      // 彩色珠子主体
      const grad = ctx.createRadialGradient(cx - 3, cy - 4, 1, cx, cy, r)
      grad.addColorStop(0, `rgba(${Math.min(255, rr + 60)},${Math.min(255, gg + 60)},${Math.min(255, bb + 60)},1)`)
      grad.addColorStop(0.5, `rgb(${rr},${gg},${bb})`)
      grad.addColorStop(1, `rgb(${Math.max(0, rr - 40)},${Math.max(0, gg - 40)},${Math.max(0, bb - 40)})`)

      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.fillStyle = grad
      ctx.fill()

      // 描边
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(255,255,255,0.08)'
      ctx.lineWidth = 0.5
      ctx.stroke()
    }
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.minFilter = THREE.LinearMipmapLinearFilter
  tex.magFilter = THREE.NearestFilter
  tex.generateMipmaps = true

  return tex
}

/** 图片加载工具 */
function loadImage(url) {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = url
  })
}
