import { Link } from 'react-router-dom'
import './Guide.css'

// ── 人物卡提示词 ──
const portraitPrompt = `Card: 【角色名】 | 【编号】 | 【性别】
【签名】

Reference type: portrait / face close-up.

This is not a photograph. This is a printed TCG collectible card illustration.

The person in this image is the same individual as the uploaded reference photo — their facial identity, bone structure, and features are identical. Render their face as a printed holographic foil TCG idol-style character card illustration in semi-realistic premium anime art style. Keep their facial identity clearly recognizable. Do not change the face, do not beautify into a generic anime face.

Art style: semi-realistic premium TCG idol card illustration — not hand-painted thick oil texture, not realistic photography, not cel-shaded flat animation. The character is drawn with commercial card illustration rendering: smooth modeled skin with fine print grain, luminous pearl-powder highlights, sharp clean linework on costume edges, dimensional light-shadow modeling with iridescent foil color bleeding into highlights. The overall finish reads as a physical printed trading card — paper substrate, offset print dots, hot-stamped silver foil border, pearlescent laser overlay.

Composition: maximum frame fill within the card's safe area. The character fills the illustration area generously — hair, shoulders, and clothing may approach or lightly touch the inner edge of the silver hot stamping border but must never extend beyond it. The entire character must remain fully inside the Outer border at all times. No element bleeds off the card edge. No small centered portrait box. Preserve the character's original pose, hand gesture, head tilt, and body angle from the reference. The face must remain clearly readable.

Card frame — unified for every card:

1. Outer border: thin matte black substrate base, raised embossed dark gunmetal silver hot stamping edging. Subtle embossed fine grain texture. Faint holographic iridescent blue-pink light refraction shimmer on the silver edge. Clean sharp rectangular frame, no rounded corners.

2. Top-left fixed text zone: upper left of the illustration area. If a character name is provided, display it in semi-transparent white sans-serif font with iridescent foil glow outline. If no name is provided, leave this zone completely empty.

3. Bottom integrated info strip: thin dark charcoal recessed embossed horizontal strip running full width of the bottom frame. Left: 「【编号】」 — ultra-small thin sans-serif, dark charcoal. Right: 「【签名】」 — tiny custom signature text, thin delicate script, dark charcoal. Both flush against the bottom inner edge.

4. Background base texture behind the character: unified lenticular holographic foil sheet. Diagonal holographic prism light bands across the background only. Dark black base with subtle embossed matte black grain. Soft iridescent cool blue-purple + warm gold-pink light refracting streaks. Foil does not cover the face.

The character is rendered in polished commercial TCG idol card style: luminous pearl-white skin with fine print texture, large expressive eyes with multi-layer highlight reflections, hair rendered in glossy smooth strands with iridescent edge light from the foil surface.

Hair style and color match the reference exactly.

Expression: cool, elegant, direct gaze toward the viewer — confident idol presence.

Costume: holographic-themed stage idol or battle-identifier outfit — shimmering, reflective, embellished with small gem-like details, not revealing, not streetwear.

Lighting: the character is lit as a card illustration — clean front-center key light to make the face readable, with cool blue-purple and warm gold-pink iridescent edge lights bleeding in from the foil surface. The lighting is illustrative, not photographic.

Printed card texture: subtle offset print dots visible at close inspection, faint paper substrate grain beneath the ink layers, pearlescent shimmer in highlight areas from the foil overlay. Sharp focus on the face. Premium SSR-level collectible card print quality. No watermark, no logo.

【核心要求】
This is a printed TCG card illustration, not a photograph. Same person as the reference. Maximum frame fill within the Outer border. Semi-realistic anime idol card art style with commercial print texture and holographic foil effects.

【避免】
Do not generate a photograph. Do not output a realistic photo of a person. Do not use photographic lighting, photographic skin rendering, or photographic background depth. Do not make it look like a cosplay photo, a selfie, or an Instagram-filtered portrait. Do not default to a generic centered portrait pose. Do not leave large empty space around the character. Do not change facial identity. Do not beautify into a generic anime face. If no character name is provided, leave the upper-left zone empty. Avoid the foil texture covering the face. Avoid pure hand-painted oil-painting texture. Avoid cel-shading flat colors. Avoid realistic photographic skin texture. Avoid visible microphone, mic, recording device, headset mic, boom mic, lavalier mic, or any audio equipment. Avoid imperial flags, rising sun motifs. Avoid distorted face, asymmetrical eyes, broken anatomy, deformed hands, extra fingers. Avoid low resolution, heavy noise, JPEG artifacts, watermark, logo.`

// ── 场景卡提示词 ──
const scenePrompt = `Card: 【编号】
【签名】

Reference type: full scene.

The reference image is a complete scene (TV still, movie frame, anime screenshot, or any full composition image). Reproduce the entire scene faithfully — the characters, their poses, expressions, costumes, the background, composition, objects, lighting, and spatial relationships — exactly as they appear in the reference. Re-render it as a collectible card illustration. Do not change the scene content. Do not add, remove, or reposition any element.

The full reference image becomes the card artwork. The card frame, border, and foil effects are added around the artwork — they do not alter the artwork itself.

9:16 vertical stand-alone card illustration. The full scene fills the illustration area. Every character and important detail from the original scene must remain fully visible. Do not crop out any part of the original composition.

Fixed unified card frame — identical for every card:

1. Outer border: thin matte black base, raised embossed dark gunmetal silver hot stamping edging. Faint holographic iridescent blue-pink refraction shimmer. Clean sharp rectangular frame, no rounded corners.

2. No text in the upper-left zone — only the artwork.

3. Bottom integrated info strip: thin dark charcoal embossed strip at the bottom of the frame. Left: 「【编号】」 — ultra-small thin sans-serif, dark charcoal. Right: 「【签名】」 — tiny custom signature text, thin delicate script, dark charcoal. Both flush against the bottom inner edge.

4. Light transparent holographic foil effect applied as a thin surface overlay — faint diagonal prism bands, cool blue-purple + warm gold-pink iridescent streaks. The foil effect is transparent and does not replace or obscure the scene artwork.

Premium collectible card texture. Sharp focus on the original scene's focal point. No watermark, no logo.

【核心要求】
This must be the exact same scene as the reference — every character, object, pose, expression, and background element faithfully reproduced. The card frame and foil are additions around the artwork, not changes to the artwork.

【避免】
Do not alter or reinterpret the scene. Do not change character poses, expressions, costumes, background, objects, or lighting from the reference. Do not zoom, crop, or reframe differently from the original scene. The entire original composition must fit within the illustration area. Do not add any text other than the number in the bottom strip and the hypn signature. Avoid the foil overlay obscuring any character or focal detail. Avoid making it look like a product photo. Avoid cel-shading. Avoid low resolution, heavy noise, JPEG artifacts, watermark, logo.`

const templates = [
  {
    name: '基础',
    desc: '深色底版 — 适配大多数卡面风格',
    src: '/templates/card-base.png',
    download: 'sucard-template-base.png',
  },
  {
    name: 'SR',
    desc: '银色蚀刻边框 — 稀有卡牌',
    src: '/templates/card-sr.png',
    download: 'sucard-template-sr.png',
  },
  {
    name: 'SSR',
    desc: '金箔边框 — 极稀有卡牌',
    src: '/templates/card-ssr.png',
    download: 'sucard-template-ssr.png',
  },
]

export default function Guide() {
  return (
    <div className="guide-page">
      {/* ── Nav Bar ── */}
      <nav className="nav-bar">
        <Link to="/" className="btn-pill btn-pill-sm">
          &larr; 返回
        </Link>
        <span className="logo">指南</span>
        <span style={{ width: 60 }} />
      </nav>

      {/* ── Hero ── */}
      <section className="hero" style={{ paddingBottom: '40px' }}>
        <p className="hero-eyebrow">文档</p>
        <h1 className="hero-title" style={{ fontSize: '48px', lineHeight: '48px', letterSpacing: '-1.2px' }}>
          如何制作 SuCard
        </h1>
      </section>

      <div className="divider" />

      <main className="guide-content">
        {/* Step 1: Templates */}
        <section className="guide-section">
          <h2 className="section-heading">
            <span className="section-step">01</span>
            下载模板
          </h2>
          <p className="guide-desc">
            三张空白卡牌模板，可在 AI 图片工具中作为参考图使用。
          </p>
          <div className="template-grid">
            {templates.map((t) => (
              <div className="template-card" key={t.name}>
                <div className="template-preview">
                  <img src={t.src} alt={`${t.name} template`} />
                </div>
                <div className="template-info">
                  <h3>{t.name}</h3>
                  <p>{t.desc}</p>
                  <a className="btn-pill btn-pill-sm download-btn" href={t.src} download={t.download}>
                    下载
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Divider between sections */}
        <div className="section-divider" />

        {/* Step 2: Specs */}
        <section className="guide-section">
          <h2 className="section-heading">
            <span className="section-step">02</span>
            卡牌规格
          </h2>
          <div className="spec-grid">
            <div className="spec-item">
              <span className="spec-label">比例</span>
              <span className="spec-value">9 : 16</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">分辨率</span>
              <span className="spec-value">1080 × 1920</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">格式</span>
              <span className="spec-value">PNG</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">命名</span>
              <span className="spec-value">001.png</span>
            </div>
          </div>
        </section>

        <div className="section-divider" />

        {/* Step 3: Portrait Card */}
        <section className="guide-section">
          <h2 className="section-heading">
            <span className="section-step">03</span>
            人物卡提示词
          </h2>
          <p className="guide-desc">
            上传一张<strong>人物照片</strong>作为参考图。AI 将保留面部特征，
            并将其渲染为全息镭射 TCG 偶像收藏卡牌。
            请将 <code>【角色名】</code>、<code>【编号】</code>、<code>【性别】</code>、<code>【签名】</code> 替换为你的内容。
          </p>

          <details className="prompt-card">
            <summary className="prompt-summary">
              <span>人物卡提示词</span>
              <button
                className="btn-pill btn-pill-sm"
                onClick={(e) => {
                  e.preventDefault()
                  navigator.clipboard.writeText(portraitPrompt)
                }}
              >
                复制
              </button>
            </summary>
            <pre className="prompt-code">{portraitPrompt}</pre>
          </details>
        </section>

        <div className="section-divider" />

        {/* Step 4: Scene Card */}
        <section className="guide-section">
          <h2 className="section-heading">
            <span className="section-step">04</span>
            场景卡提示词
          </h2>
          <p className="guide-desc">
            上传一张<strong>完整场景</strong>（剧照、电影帧、动漫截图）作为参考图。
            AI 将忠实还原整个构图，并添加统一的卡框和全息镭射效果。
            请将 <code>【编号】</code> 替换为 3 位数字。
          </p>

          <details className="prompt-card">
            <summary className="prompt-summary">
              <span>场景卡提示词</span>
              <button
                className="btn-pill btn-pill-sm"
                onClick={(e) => {
                  e.preventDefault()
                  navigator.clipboard.writeText(scenePrompt)
                }}
              >
                复制
              </button>
            </summary>
            <pre className="prompt-code">{scenePrompt}</pre>
          </details>
        </section>

        <div className="section-divider" />

        {/* Step 5: 生成流程 */}
        <section className="guide-section">
          <h2 className="section-heading">
            <span className="section-step">05</span>
            生成流程
          </h2>
          <p className="guide-desc">
            在 AI 图片工具中上传 2 张参考图 + 粘贴提示词，即可生成卡牌：
          </p>
          <ol className="step-list">
            <li>
              上传<strong>人物/情景参考图</strong>作为第一张参考图
            </li>
            <li>
              上传<strong>卡面模板</strong>作为第二张参考图
            </li>
            <li>
              粘贴对应的提示词（人物卡或场景卡），点击生成
            </li>
          </ol>
        </section>

        <div className="section-divider" />

        {/* Step 6: Card Back */}
        <section className="guide-section">
          <h2 className="section-heading">
            <span className="section-step">06</span>
            卡背
          </h2>
          <p className="guide-desc">
            卡背设计对所有卡牌通用。将
            <code>public/images/cards/back.png</code> 替换为你自己的设计即可。
          </p>
        </section>

        <div className="section-divider" />

        {/* Step 7: Tips */}
        <section className="guide-section">
          <h2 className="section-heading">
            <span className="section-step">07</span>
            小贴士
          </h2>
          <ul className="step-list">
            <li>保持统一的<strong>美术风格</strong>，让整个收藏系列协调一致</li>
            <li>每张卡牌选择不同的主题，翻牌时更有惊喜感</li>
            <li>对称的卡背设计易于辨识，又保持神秘感</li>
            <li>先以 5-10 张同风格卡牌起步，再逐步扩展</li>
          </ul>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="footer">
        <p>SuCards 指南 · 最后更新于 2026 年 7 月</p>
      </footer>
    </div>
  )
}
