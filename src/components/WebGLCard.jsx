import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import './WebGLCard.css'

/* ── Constants ── */
const CARD_W = 0.9
const CARD_H = 1.6
const CAMERA_Z = 2.8
const LERP = 0.14       // 静止/翻转时的过渡系数
const DRAG_LERP = 0.35  // 拖拽时的跟手系数
const ROT_SENS = 0.005  // 鼠标像素 → 弧度
const TILT_SENS = 0.003 // 垂直拖拽倾斜灵敏度
const MAX_TILT = 0.35   // 最大 X 轴倾斜
const INERTIA_DECAY = 0.94
const DRAG_THRESH = 3   // 超过此像素视为拖拽（否则视为点击）

/* ── 自动释放纹理 ── */
function setTex(mesh, tex) {
  if (mesh.material.map) mesh.material.map.dispose()
  mesh.material.map = tex
  mesh.material.color.set(0xffffff)
  mesh.material.needsUpdate = true
}

export default function WebGLCard({ frontSrc, backSrc, flipped, placeholder }) {
  const root = useRef(null)
  const [loading, setLoading] = useState(true)

  // ── Three.js 持久引用 ──
  const s = useRef({
    renderer: null,
    scene: null,
    camera: null,
    group: null,
    front: null,
    back: null,
    geo: null,
    fMat: null,
    bMat: null,
    raf: 0,
    gone: false,

    // 旋转状态
    targetY: 0,         // Y 轴目标弧度（lerp 向此值）
    targetX: 0,         // X 轴倾斜目标
    velY: 0,            // 惯性速度
    dragging: false,
    dragMoved: false,   // 本次拖拽是否产生了位移
    dragStartX: 0,
    dragStartY: 0,
    dragStartRotY: 0,
    lastX: 0,
    lastTime: 0,
  })

  /* ═══════ Init scene ═══════ */
  useEffect(() => {
    const d = s.current
    const el = root.current
    if (!el) return

    const r = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    r.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    r.outputColorSpace = THREE.SRGBColorSpace
    el.appendChild(r.domElement)

    const scene = new THREE.Scene()
    const cam = new THREE.PerspectiveCamera(35, 1, 0.1, 10)
    cam.position.set(0, 0, CAMERA_Z)

    // 光照
    scene.add(new THREE.AmbientLight(0xffffff, 0.7))
    const key = new THREE.DirectionalLight(0xffffff, 0.65)
    key.position.set(1, 0.6, 2)
    scene.add(key)
    const fill = new THREE.DirectionalLight(0xffffff, 0.2)
    fill.position.set(-0.4, -0.3, -0.5)
    scene.add(fill)

    const group = new THREE.Group()
    scene.add(group)

    const geo = new THREE.PlaneGeometry(CARD_W, CARD_H)
    d.geo = geo

    const fMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.38, metalness: 0.04 })
    d.fMat = fMat
    const front = new THREE.Mesh(geo, fMat)
    d.front = front
    group.add(front)

    const bMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.38, metalness: 0.04 })
    d.bMat = bMat
    const back = new THREE.Mesh(geo, bMat)
    back.rotation.y = Math.PI
    d.back = back
    group.add(back)

    d.renderer = r
    d.scene = scene
    d.camera = cam
    d.group = group

    // 动画循环
    const loop = () => {
      if (d.gone) return
      d.raf = requestAnimationFrame(loop)

      // 惯性衰减
      if (!d.dragging && Math.abs(d.velY) > 0.001) {
        d.targetY += d.velY
        d.velY *= INERTIA_DECAY
      }

      const factor = d.dragging ? DRAG_LERP : LERP
      group.rotation.y += (d.targetY - group.rotation.y) * factor
      group.rotation.x += (d.targetX - group.rotation.x) * factor

      r.render(scene, cam)
    }
    loop()

    // Resize
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const { width, height } = e.contentRect
        if (!width || !height) continue
        r.setSize(width, height, false)
        cam.aspect = width / height
        cam.updateProjectionMatrix()
      }
    })
    ro.observe(el)

    return () => {
      d.gone = true
      cancelAnimationFrame(d.raf)
      ro.disconnect()
      r.dispose()
      geo.dispose()
      fMat.dispose()
      bMat.dispose()
      if (el.contains(r.domElement)) el.removeChild(r.domElement)
    }
  }, [])

  /* ═══════ 鼠标/触摸拖拽旋转 ═══════ */
  useEffect(() => {
    const el = root.current
    if (!el) return
    const d = s.current

    const getXY = (e) => {
      if (e.touches && e.touches.length) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY }
      }
      return { x: e.clientX, y: e.clientY }
    }

    const onDown = (e) => {
      // 只响应左键（鼠标）或触摸
      if (e.button !== undefined && e.button !== 0) return
      e.preventDefault()
      const { x, y } = getXY(e)
      d.dragging = true
      d.dragMoved = false
      d.dragStartX = x
      d.dragStartY = y
      d.dragStartRotY = d.targetY
      d.velY = 0
      d.lastX = x
      d.lastTime = performance.now()
    }

    const onMove = (e) => {
      if (!d.dragging) return
      const { x, y } = getXY(e)
      const dx = x - d.dragStartX
      const dy = y - d.dragStartY

      if (Math.abs(dx) + Math.abs(dy) > DRAG_THRESH) {
        d.dragMoved = true
      }
      if (!d.dragMoved) return

      d.targetY = d.dragStartRotY + dx * ROT_SENS
      d.targetX = Math.max(-MAX_TILT, Math.min(MAX_TILT, -dy * TILT_SENS))

      // 计算惯性速度
      const now = performance.now()
      const dt = (now - d.lastTime) / 1000
      if (dt > 0.001) {
        d.velY = (x - d.lastX) * ROT_SENS / dt
      }
      d.lastX = x
      d.lastTime = now
    }

    const onUp = (e) => {
      if (!d.dragging) return
      d.dragging = false
      d.targetX = 0 // 松开后 X 轴回正
      // 如果发生了拖拽，阻止后续 click 冒泡
      if (d.dragMoved) {
        e.stopPropagation()
        e.preventDefault()
      }
    }

    el.addEventListener('mousedown', onDown)
    el.addEventListener('touchstart', onDown, { passive: false })
    window.addEventListener('mousemove', onMove)
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchend', onUp)

    return () => {
      el.removeEventListener('mousedown', onDown)
      el.removeEventListener('touchstart', onDown)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchend', onUp)
    }
  }, [])

  /* ═══════ Load front texture ═══════ */
  useEffect(() => {
    if (!frontSrc) return setLoading(false)
    setLoading(true)
    const d = s.current
    new THREE.TextureLoader().load(
      frontSrc,
      (tex) => {
        if (d.gone) return
        tex.colorSpace = THREE.SRGBColorSpace
        tex.minFilter = THREE.LinearMipmapLinearFilter
        tex.magFilter = THREE.LinearFilter
        setTex(d.front, tex)
        setLoading(false)
      },
      undefined,
      () => setLoading(false),
    )
  }, [frontSrc])

  /* ═══════ Load back texture ═══════ */
  useEffect(() => {
    const d = s.current
    if (!backSrc) return
    new THREE.TextureLoader().load(
      backSrc,
      (tex) => {
        if (d.gone) return
        tex.colorSpace = THREE.SRGBColorSpace
        tex.minFilter = THREE.LinearMipmapLinearFilter
        tex.magFilter = THREE.LinearFilter
        setTex(d.back, tex)
      },
      undefined,
      () => {},
    )
  }, [backSrc])

  /* ═══════ Flip（点击翻转） ═══════ */
  const isFirstFlip = useRef(true)
  useEffect(() => {
    if (isFirstFlip.current) {
      isFirstFlip.current = false
      return
    }
    const d = s.current
    d.targetY += Math.PI
    d.velY = 0
  }, [flipped])

  return (
    <div ref={root} className="webgl-card">
      {loading && placeholder && (
        <div className="webgl-card-loading">
          {placeholder}
        </div>
      )}
    </div>
  )
}
