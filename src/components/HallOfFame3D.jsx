import { useRef, useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Physics, RigidBody, CuboidCollider, useBeforePhysicsStep } from '@react-three/rapier'
import { Text, Line, Environment } from '@react-three/drei'
import * as THREE from 'three'
import { createPerlerTexture } from '../utils/perlerTexture'
import './HallOfFame3D.css'

/* ================================================================
   ORNAMENTS DATA
   ================================================================ */
const ORNAMENTS = [
  { id: 1, image: '/images/cards/sucard-000.png',     label: '卡面1' },
  { id: 2, image: '/images/cards/sucard-special.png',  label: '卡面2' },
  { id: 3, image: '/images/perler-keychain.png',       label: 'PERLER' },
]

const CARD_W = 0.75
const CARD_H = 1.05
const CARD_D = 0.04
const ROPE_LEN = 1.3
const NAIL_Y = 2.2
const RACK_Z = 0
const STIFFNESS = 15                       // 绳子约束刚度
const DAMPING = 0.92                       // 摆动衰减
const NAIL_SPACING = 1.05

/* ================================================================
   MAIN PAGE
   ================================================================ */
export default function HallOfFame3D() {
  return (
    <div className="hof3d-page">
      {/* 导航 */}
      <nav className="nav-bar hof3d-nav">
        <Link to="/" className="logo">SuCards</Link>
        <div className="nav-actions">
          <Link to="/" className="btn-pill btn-pill-sm">首页</Link>
          <Link to="/guide" className="btn-pill btn-pill-sm">指南</Link>
        </div>
      </nav>

      {/* 标题 */}
      <div className="hof3d-hero">
        <p className="hof3d-eyebrow">HALL OF FAME</p>
        <h1 className="hof3d-title">名人堂</h1>
        <p className="hof3d-sub">拖拽卡牌互动 · 拼豆钥匙链 3D 展示</p>
      </div>

      {/* 3D 画布 */}
      <div className="hof3d-canvas-wrap">
        <Canvas
          camera={{ position: [0, 0.6, 5.5], fov: 42 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: false }}
        >
          <color attach="background" args={['#0e0e12']} />
          <fog attach="fog" args={['#0e0e12', 4, 16]} />
          <PhysicsScene />
        </Canvas>
      </div>

      {/* 提示 */}
      <p className="hof3d-hint">拖拽任意挂件试试</p>

      {/* 页脚 */}
      <footer className="hof3d-footer">
        <p>每个挂件都是一段故事 · SuCards 名人堂</p>
      </footer>
    </div>
  )
}

/* ================================================================
   3D PHYSICS SCENE
   ================================================================ */
function PhysicsScene() {
  const { viewport } = useThree()

  return (
    <Physics gravity={[0, -8, 0]} timeStep="vary">
      {/* 灯光 */}
      <ambientLight intensity={0.4} />
      <spotLight
        position={[3, 4, 6]}
        angle={0.5}
        penumbra={0.6}
        intensity={2.5}
        castShadow
      />
      <pointLight position={[-3, 1, 4]} intensity={0.8} color="#ffd4a0" />

      {/* 展示架 */}
      <DisplayRack count={ORNAMENTS.length} />

      {/* 挂件们 */}
      {ORNAMENTS.map((o, i) => (
        <PerlerKeychain
          key={o.id}
          image={o.image}
          label={o.label}
          nailX={nailX(i)}
        />
      ))}
    </Physics>
  )
}

/** 根据序号计算钉子在展示架上的 X 位置 */
function nailX(index) {
  const total = ORNAMENTS.length
  const offset = ((total - 1) * NAIL_SPACING) / 2
  return index * NAIL_SPACING - offset
}

/* ================================================================
   DISPLAY RACK (展示架横梁 + 钉子)
   ================================================================ */
function DisplayRack({ count }) {
  const w = count * NAIL_SPACING + 1.0

  return (
    <group>
      {/* 横梁 */}
      <RigidBody type="fixed" position={[0, NAIL_Y, RACK_Z]}>
        <mesh castShadow>
          <boxGeometry args={[w, 0.28, 0.18]} />
          <meshStandardMaterial color="#3a2e1f" roughness={0.7} metalness={0.05} />
        </mesh>
        {/* 顶部高光条 */}
        <mesh position={[0, 0.15, 0.095]}>
          <boxGeometry args={[w - 0.3, 0.04, 0.02]} />
          <meshStandardMaterial color="#5a4a32" roughness={0.3} />
        </mesh>
      </RigidBody>

      {/* 钉子 */}
      {Array.from({ length: count }).map((_, i) => (
        <group key={i} position={[nailX(i), NAIL_Y - 0.12, RACK_Z + 0.1]}>
          <mesh>
            <sphereGeometry args={[0.07, 16, 12]} />
            <meshStandardMaterial
              color="#c8c8c8"
              roughness={0.25}
              metalness={0.7}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/* ================================================================
   PERLER KEYCHAIN (单个挂件：绳 + 拼豆卡牌)
   ================================================================ */
function PerlerKeychain({ image, label, nailX }) {
  const cardRef = useRef(null)          // Rapier RigidBody
  const meshRef = useRef(null)          // 卡牌 mesh（拖拽目标）
  const isDragging = useRef(false)
  const dragPos = useRef([0, 0])
  const prevVel = useRef([0, 0])

  const prevTranslation = useRef(new THREE.Vector3(nailX, NAIL_Y - ROPE_LEN, RACK_Z))

  // 加载拼豆纹理
  const [perlerTex, setPerlerTex] = useState(null)
  useEffect(() => {
    let cancelled = false
    createPerlerTexture(image).then((tex) => {
      if (!cancelled && tex) setPerlerTex(tex)
    })
    return () => { cancelled = true }
  }, [image])

  // ── 绳子约束（每物理帧执行） ──
  useBeforePhysicsStep((_world) => {
    if (isDragging.current) return
    const api = cardRef.current
    if (!api) return

    const t = api.translation()
    const px = t.x, py = t.y
    const ax = nailX, ay = NAIL_Y

    const dx = px - ax
    const dy = py - ay
    const dist = Math.hypot(dx, dy)

    if (dist < 0.01) return

    const nx = dx / dist
    const ny = dy / dist

    // 超过绳长 → 施加朝向锚点的脉冲
    if (dist > ROPE_LEN) {
      const over = dist - ROPE_LEN
      const impulseX = -nx * over * STIFFNESS
      const impulseY = -ny * over * STIFFNESS
      api.applyImpulse({ x: impulseX, y: impulseY, z: 0 }, true)
    }

    // 阻尼
    const lv = api.linvel()
    api.setLinvel({ x: lv.x * DAMPING, y: lv.y * DAMPING, z: 0 }, true)
  })

  // ── 拖拽交互（在卡牌 mesh 上） ──
  const { camera, gl } = useThree()

  const handlePointerDown = (e) => {
    e.stopPropagation()
    isDragging.current = true
    const api = cardRef.current
    if (api) api.setBodyType(1, true) // kinematic
    dragPos.current = [e.clientX, e.clientY]
    gl.domElement.style.cursor = 'grabbing'
  }

  const handlePointerMove = (e) => {
    if (!isDragging.current) return
    e.stopPropagation()

    const api = cardRef.current
    if (!api) return

    const dx = (e.clientX - dragPos.current[0]) * 0.008
    const dy = (e.clientY - dragPos.current[1]) * 0.008
    dragPos.current = [e.clientX, e.clientY]

    const currentTrans = api.translation()
    let nx = currentTrans.x + dx
    let ny = currentTrans.y - dy

    // 限制在绳子范围内
    const adx = nx - nailX
    const ady = ny - NAIL_Y
    const adist = Math.hypot(adx, ady)
    if (adist > ROPE_LEN) {
      const ratio = ROPE_LEN / adist
      nx = nailX + adx * ratio
      ny = NAIL_Y + ady * ratio
    }

    api.setNextKinematicTranslation({ x: nx, y: ny, z: RACK_Z })
    prevTranslation.current.set(nx, ny, RACK_Z)
  }

  const handlePointerUp = () => {
    if (!isDragging.current) return
    isDragging.current = false
    const api = cardRef.current
    if (api) {
      api.setBodyType(2, true) // dynamic
      api.setLinvel({ x: 0, y: 0, z: 0 }, true)
    }
    gl.domElement.style.cursor = ''
  }

  // 全局 pointerup（鼠标移到画布外松开的情况）
  useEffect(() => {
    const onUp = () => {
      if (!isDragging.current) return
      isDragging.current = false
      const api = cardRef.current
      if (api) {
        api.setBodyType(2, true)
        api.setLinvel({ x: 0, y: 0, z: 0 }, true)
      }
      gl.domElement.style.cursor = ''
    }
    window.addEventListener('pointerup', onUp)
    return () => window.removeEventListener('pointerup', onUp)
  }, [])

  // ── 绳子可视化（更新 Line 顶点） ──
  const ropeLineRef = useRef(null)
  useFrame(() => {
    if (!ropeLineRef.current) return

    const api = cardRef.current
    let cx = prevTranslation.current.x
    let cy = prevTranslation.current.y

    if (api && !isDragging.current) {
      const t = api.translation()
      cx = t.x
      cy = t.y
    }

    // 绳子：锚点 → 中间点（自然下垂） → 卡牌顶端
    const midX = (nailX + cx) / 2
    const midY = (NAIL_Y + cy + CARD_H / 2) / 2 + 0.08 // 微下垂
    const cardTopX = cx
    const cardTopY = cy + CARD_H / 2

    const positions = ropeLineRef.current.geometry.attributes.position
    positions.setXYZ(0, nailX, NAIL_Y, RACK_Z)
    positions.setXYZ(1, midX, midY, RACK_Z)
    positions.setXYZ(2, cardTopX, cardTopY, RACK_Z)
    positions.needsUpdate = true

    prevTranslation.current.set(cx, cy, RACK_Z)
  })

  // 绳子顶点（初始）
  const ropePts = useMemo(() => [
    new THREE.Vector3(nailX, NAIL_Y, RACK_Z),
    new THREE.Vector3(nailX, NAIL_Y - ROPE_LEN * 0.45, RACK_Z),
    new THREE.Vector3(nailX, NAIL_Y - ROPE_LEN + CARD_H / 2, RACK_Z),
  ], [nailX])

  return (
    <group>
      {/* ── 金属环（视觉，固定） ── */}
      <group position={[nailX, NAIL_Y, RACK_Z]}>
        <mesh>
          <torusGeometry args={[0.1, 0.025, 8, 16]} />
          <meshStandardMaterial color="#ddd" roughness={0.2} metalness={0.8} />
        </mesh>
      </group>

      {/* ── 绳子可视化 ── */}
      <Line
        ref={ropeLineRef}
        points={ropePts}
        color="#888"
        lineWidth={1.5}
        transparent
        opacity={0.7}
      />

      {/* ── 卡牌物理体 ── */}
      <RigidBody
        ref={cardRef}
        colliders={false}
        mass={0.4}
        linearDamping={0.3}
        angularDamping={0.7}
        canSleep={false}
        position={[nailX, NAIL_Y - ROPE_LEN, RACK_Z]}
        lockRotations
      >
        <CuboidCollider args={[CARD_W / 2, CARD_H / 2, CARD_D / 2]} />

        {/* 卡牌视觉 */}
        <mesh
          ref={meshRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <boxGeometry args={[CARD_W, CARD_H, CARD_D]} />
          {perlerTex ? (
            <meshStandardMaterial
              map={perlerTex}
              roughness={0.55}
              metalness={0.05}
            />
          ) : (
            <meshStandardMaterial color="#2a2a2a" roughness={0.5} />
          )}
        </mesh>

        {/* 卡牌边框（塑料质感） */}
        <mesh>
          <boxGeometry args={[CARD_W + 0.04, CARD_H + 0.04, CARD_D + 0.01]} />
          <meshStandardMaterial
            color="#444"
            roughness={0.3}
            metalness={0.1}
            transparent
            opacity={0.3}
          />
        </mesh>
      </RigidBody>

      {/* ── 标签 ── */}
      <Text
        position={[nailX, NAIL_Y - ROPE_LEN - CARD_H / 2 - 0.2, RACK_Z]}
        fontSize={0.12}
        color="#666"
        anchorX="center"
        anchorY="top"
      >
        {label}
      </Text>
    </group>
  )
}
