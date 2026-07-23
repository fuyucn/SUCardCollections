import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Guide.css'

// ── 提示词占位符替换 ──
function fillPrompt(template, values) {
  let result = template
  for (const [key, val] of Object.entries(values)) {
    result = result.replaceAll(key, val ?? '')
  }
  return result
}

// ── 人物卡提示词 ──
const portraitPrompt = `# Complete Image Generation Prompt — Portrait Card

Character name: "【角色名】"
Card number: "【编号】"
Gender: "【性别】"

Reference type: portrait / face close-up.

This is not a photograph. This is a printed TCG collectible card illustration.

The person in this image is the same individual as the uploaded reference photo — their facial identity, bone structure, and features are identical. Render their face as a printed holographic foil TCG idol-style character card illustration in semi-realistic premium anime art style（半写实日系动漫卡牌插画风格）. Keep their facial identity clearly recognizable. Do not change the face, do not beautify into a generic anime face. 人物保留原生五官辨识度，做半动漫化卡牌精致美化处理，脸部五官骨骼与参考图完全一致。

Art style: semi-realistic premium TCG idol card illustration（半写实日系动漫TCG卡牌插画） — not hand-painted thick oil texture, not realistic photography, not cel-shaded flat animation. The character is drawn with commercial card illustration rendering: smooth modeled skin with fine print grain, luminous pearl-powder highlights, sharp clean linework on costume edges, dimensional light-shadow modeling with iridescent foil color bleeding into highlights. The overall finish reads as a physical printed trading card — paper substrate, offset print dots, hot-stamped silver foil border, pearlescent laser overlay.

Composition: the character must fill the frame — spanning nearly the full width of the illustration area, shoulder-to-shoulder, edge to edge. Hair, shoulders, arms, and clothing extend outward to touch or nearly touch the left and right inner edges of the card border. The head sits close to the upper safe area; the body extends downward, occupying the vertical space fully. The character feels naturally composed into the card — not a floating cutout or a small centered portrait floating in empty space. This is a filled collectible card illustration, not a photo pasted onto a background. The entire character remains fully inside the outer border at all times, nothing bleeds off the card edge. Preserve the character's original pose, hand gesture, head tilt, and body angle from the reference. Face clearly readable.

Card frame — use the card template from the reference image EXACTLY as-is:

CRITICAL: A card template image (base/SR/SSR) has been uploaded as a separate reference. This template defines the final card appearance. Preserve the template's exact card frame, border style, foil effects, texture, color, and proportions faithfully — do NOT redesign or replace the frame. The template is the authoritative source for the card's visual frame.

1. Outer border: use the exact border style, color, thickness, metallic finish, and holographic effects from the template reference image. Do not alter, reinterpret, or replace the frame design.

2. Top-left fixed text zone: upper left of the illustration area. If a character name is provided, display it in semi-transparent white sans-serif font with iridescent foil glow outline. If no name is provided, leave this zone completely empty.

3. Bottom integrated info strip: bottom-left corner displays "【编号】" in ultra-small thin sans-serif, dark charcoal; bottom-right corner displays "【签名】" in thin delicate script, dark charcoal. Position these texts on the bottom strip area of the template frame.

4. Background base texture behind the character: use the holographic foil effect and background from the template reference image. Foil does not cover the face.

The character is rendered in polished commercial TCG idol card style: luminous pearl-white skin with fine print texture, large expressive eyes with multi-layer highlight reflections, hair rendered in glossy smooth strands with iridescent edge light from the foil surface.

Hair style and color match the reference exactly.

Expression: cool, elegant, direct gaze toward the viewer — confident idol presence.

Costume: match the reference exactly — preserve the original clothing, outfit colors, fabric details, accessories, and overall style as seen in the reference photo. Do not redesign or replace the costume.

Lighting: the character is lit as a card illustration — clean front-center key light to make the face readable, with cool blue-purple and warm gold-pink iridescent edge lights bleeding in from the foil surface. The lighting is illustrative, not photographic.

Printed card texture: subtle offset print dots visible at close inspection, faint paper substrate grain beneath the ink layers, pearlescent shimmer in highlight areas from the foil overlay. Sharp focus on the face. Premium SSR-level collectible card print quality. No watermark, no logo.

【核心要求】
This is a printed TCG card illustration, not a photograph. Same person as the reference. Character fills the frame — nearly full width, shoulder-to-shoulder, edge to edge, no empty margins. Semi-realistic anime idol card art style with commercial print texture and holographic foil effects. Output resolution must be exactly 1600 × 2848 pixels, or an exact proportional version of that aspect ratio (9:16).

【图层约束 — 绝对禁止花纹前置】
All floral embossments, silk ribbons, holographic light streaks, sparkles, and ornamental patterns anywhere in the inner frame are strictly rendered BEHIND the character. 全部浮雕花卉、丝绸褶皱、镭射光带、星芒闪粉只能渲染在人物轮廓后方，绝对禁止出现在人物身体表面。人物全身完整轮廓干净，身体表面无任何花纹穿插覆盖。
Bottom floral embossments, silk ribbons and holographic light streaks in lower inner frame are strictly rendered BEHIND character's hem and legs, never overlaying lower body, no foreground decoration covering character's clothes and limbs.
卡牌内区域下半部分所有浮雕花卉、丝绸褶皱、镭射光带、星光仅渲染在人物衣摆、腿部轮廓后方空白处，禁止向上延伸、穿插、覆盖人物下半身，人物衣摆与腿部表面干净无任何底层花纹遮挡。

## 负面提示词（重点规避花纹前置遮挡）

(low quality, worst quality:1.4), lower floral pattern overlapping character legs, bottom embossed flowers overlaying clothing hem, foreground silk ribbons covering lower body, floral ornament in front of character, decoration covering character body, pattern on top of person, 下方浮雕花纹位于人物前方，左下右下花卉压衣摆，底部丝绸光效覆盖腿部，花纹穿插人物下半身，浮雕花叠在人物身上，花纹遮挡人物，前景花纹,
下方浮雕花纹在人物前方、左下 / 右下花卉压衣摆、花卉覆盖腿部、花纹穿插人物下半身，图层顺序颠倒，四角浮雕花卉 / 丝绸 / 镭射光轨 / 星光叠在人物身前，光效穿透遮挡脸部、眼镜、发丝、手掌、上衣；人物发丝 / 手肘 / 衣摆 / 脚部紧贴、触碰、超出内边框，人物侵入顶部铭牌、底部编号条区域；边框、UI 文字被人物遮挡；裁切人物五官 / 手部 / 身体；篡改人物脸型五官、网红通用换脸；原图领夹麦克风、畸形手指、不对称双眼、残缺肢体；修改卡牌边框、圆角、切角、新增分割装饰；红色辅助线、红框、标注文字；水印、logo、乱码、重复编号；纯真人照片、厚涂油画、平涂卡通；五官扭曲、大面积光斑覆盖人物主体

Avoid photographic lighting, photographic skin rendering, photographic background depth. Avoid cosplay photo, selfie, Instagram-filtered portrait look. Avoid placing character floating in empty space — fill nearly full width, shoulder-to-shoulder, edge to edge. Avoid changing facial identity or generic anime face replacement. Avoid foil texture covering the face. Avoid visible microphone or audio equipment. Avoid imperial flags, rising sun motifs. Avoid low resolution, heavy noise, JPEG artifacts.`

// ── 场景卡提示词 ──
const scenePrompt = `# Complete Image Generation Prompt — Scene Card

## Main Prompt

Card: 【编号】

Reference type: full scene.

The reference image is a complete scene (TV still, movie frame, anime screenshot, or any full composition image). Reproduce the entire scene faithfully — the characters, their poses, expressions, costumes, the background, composition, objects, lighting, and spatial relationships — exactly as they appear in the reference. Re-render it as a collectible card illustration. Do not change the scene content. Do not add, remove, or reposition any element.

The full reference image becomes the card artwork. The card frame, border, and foil effects are added around the artwork — they do not alter the artwork itself.

9:16 vertical stand-alone card illustration. The full scene fills the illustration area. Every character and important detail from the original scene must remain fully visible. Do not crop out any part of the original composition.

Card frame — use the card template from the reference image EXACTLY as-is:

CRITICAL: A card template image (base/SR/SSR) has been uploaded as a separate reference. This template defines the final card appearance. Preserve the template's exact card frame, border style, foil effects, texture, color, and proportions faithfully — do NOT redesign or replace the frame. The template is the authoritative source for the card's visual frame.

1. Outer border: use the exact border style, color, thickness, metallic finish, and holographic effects from the template reference image. Do not alter, reinterpret, or replace the frame design.

2. Upper-left name plate zone: remove it completely. No character name text, no name plate background, no name plate border — the scene artwork fills through this area uninterrupted. 模板左上角角色铭牌区域必须移除留空，不显示任何角色名文字、铭牌底色和铭牌边框，该区域由场景画面完整填充。

3. Bottom integrated info strip: bottom-left corner displays "【编号】" in ultra-small thin sans-serif, dark charcoal; bottom-right corner displays "【签名】" in thin delicate script, dark charcoal. Position these texts on the bottom strip area of the template frame.

4. Holographic foil overlay: use the foil effect from the template reference image. The foil effect is transparent and does not replace or obscure the scene artwork.

Premium collectible card texture. Sharp focus on the original scene's focal point. No watermark, no logo.

【核心要求】
This must be the exact same scene as the reference — every character, object, pose, expression, and background element faithfully reproduced. The card frame and foil are additions around the artwork, not changes to the artwork. Output resolution must be exactly 1600 × 2848 pixels, or an exact proportional version of that aspect ratio (9:16).

## Avoid

Do not alter or reinterpret the scene. Do not change character poses, expressions, costumes, background, objects, or lighting from the reference.

Do not zoom, crop, or reframe differently from the original scene. The entire original composition must fit within the illustration area.

Do not add any text other than the number in the bottom strip and the 【签名】 signature.

Avoid the foil overlay obscuring any character or focal detail. Avoid making it look like a product photo. Avoid cel-shading.

Avoid low resolution, heavy noise, JPEG artifacts, watermark, logo.`

// ── 全画卡面提示词 ──
const fullartPrompt = `# Complete Image Generation Prompt — Full Art Card

Card number: "【编号】"
Signature: "【签名】"

Reference type: full-art borderless card. This is NOT a traditional framed card — this is a borderless full-art TCG collectible card where the entire canvas is one seamless illustration.

【全画卡面定义】
全画卡面 = 无边框、无铭牌、无编号条、无装饰框。整张卡从边缘到边缘全部是完整的插画内容，没有任何 UI 元素分割画面。1600 × 2848 竖版画布被完整画面填满，不留黑边、白边或装饰框。

CRITICAL: A full-art card template image has been uploaded as a separate reference. This template defines the overall artistic style, color palette, lighting mood, and texture quality of the final output. Follow the template's visual tone faithfully.

【绝对禁止的 UI 元素】
以下元素在输出中必须完全不存在：
— 无任何形式的卡框、边框、描边包裹画面
— 无顶部角色铭牌区域
— 无底部编号横条区域
— 无四角浮雕或装饰花纹
— 无卡片边框压纹或金属边框
— 无大面积单色背景衬底
— 仅可保留右下角微小手写签名 "【签名】" 和左下角微小序列号 "【编号】"
— 这两个文字标记不能带有色条或铭牌底板，仅纯文字直接印在画面表面

【构图要求】
画面从卡面最上沿到最下沿、最左沿到最右沿完整填满，无留白。画面主体（人物或场景）自然占据全部画面空间，构图饱满但不拥挤。上下左右画面延伸到画布边缘，模拟无边框全画幅卡牌效果。

【画风与工艺】
半写实日系 TCG 全画卡牌插画风格。半动漫融合真人原生人像辨识度。柔和顺滑细腻轮廓线，多层渐变柔和明暗阴影。带细微胶版印刷颗粒质感，整体通体珠光全息箔片发光。正面均匀柔和主光源打亮画面主体。冷调全息轮廓光在画面边缘呈现。高品质收藏级珠光烫银印刷效果，画面高清锐利，无模糊噪点虚化。

【参考图绑定】
必须严格参考人物参考图，完整保留参考图人物的脸型骨骼、五官、眼镜、发型、肢体手势、上衣款式与整体气质。禁止自主修改长相、五官、发型、服饰、肢体动作，禁止换脸、套用通用网红建模。如果参考图为场景图，则忠实还原整个场景构图。

## 负面提示词

card border, card frame, border frame, name plate, name badge, number bar, text bar, UI overlay, HUD element, ornamental border, decorative frame, metal border, gold border, silver border, 卡框, 边框, 铭牌, 编号条, 名称栏, UI元素, 装饰框, 金属框,
lower floral pattern overlapping character legs, bottom embossed flowers overlaying clothing hem, foreground silk ribbons covering lower body, decoration covering character body, pattern on top of person, 下方浮雕花纹位于人物前方, 花纹遮挡人物, 前景花纹, 图层顺序颠倒,
篡改人物脸型五官, 网红通用换脸, 原图领夹麦克风, 畸形手指, 不对称双眼, 残缺肢体, 裁切人物五官手部身体, 红色辅助线, 红框, 标注文字, 水印, logo, 乱码, 重复编号, 纯真人照片, 厚涂油画, 平涂卡通, 五官扭曲, 大面积光斑覆盖主体, low quality, worst quality, low resolution, heavy noise, JPEG artifacts`


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
  {
    name: '全画',
    desc: '无边框全幅插画 — 极致收藏卡',
    src: '/templates/card-fullart.png',
    download: 'sucard-template-fullart.png',
  },
]

export default function Guide() {
  // ── 复制状态 ──
  const [copied, setCopied] = useState(false)

  // ── 人物卡表单状态 ──
  const [pName, setPName] = useState('')
  const [pNumber, setPNumber] = useState('')
  const [pGender, setPGender] = useState('')
  const [pSign, setPSign] = useState('')

  // ── 场景卡表单状态 ──
  const [sNumber, setSNumber] = useState('')
  const [sSign, setSSign] = useState('')

  // ── 全画卡面表单状态 ──
  const [fNumber, setFNumber] = useState('')
  const [fSign, setFSign] = useState('')

  const portraitFilled = fillPrompt(portraitPrompt, {
    '【角色名】': pName,
    '【编号】': pNumber.toUpperCase(),
    '【性别】': pGender,
    '【签名】': pSign,
  })

  const sceneFilled = fillPrompt(scenePrompt, {
    '【编号】': sNumber.toUpperCase(),
    '【签名】': sSign,
  })

  const fullartFilled = fillPrompt(fullartPrompt, {
    '【编号】': fNumber.toUpperCase(),
    '【签名】': fSign,
  })

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
            四张空白卡牌模板，可在 AI 图片工具中作为参考图使用。
          </p>
          <div className="template-grid">
            {templates.map((t) => (
              <div className="template-card" key={t.name}>
                <div className="template-preview">
                  <img src={t.src} alt={`${t.name} template`} />
                  <a className="download-btn" href={t.src} download={t.download}>
                    下载模板
                  </a>
                </div>
                <div className="template-info">
                  <h3>{t.name}</h3>
                  <p>{t.desc}</p>
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
              <span className="spec-value">1600 × 2848</span>
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
            同时上传<strong>人物照片</strong>和<strong>一张模板图</strong>（基础/SR/SSR）作为参考图。
            AI 将保留面部特征，并套用你选择的模板卡框样式。
            填写下方字段，一键生成你专属的提示词。
          </p>

          <div className="prompt-gen">
            <div className="prompt-fields">
              <label className="prompt-field">
                <span>角色名</span>
                <input
                  type="text"
                  placeholder="例如：小云雀"
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                />
              </label>
              <label className="prompt-field">
                <span>编号</span>
                <input
                  type="text"
                  placeholder="例如：SU-001"
                  value={pNumber}
                  onChange={(e) => setPNumber(e.target.value)}
                />
              </label>
              <label className="prompt-field">
                <span>性别</span>
                <input
                  type="text"
                  placeholder="例如：女"
                  value={pGender}
                  onChange={(e) => setPGender(e.target.value)}
                />
              </label>
              <label className="prompt-field">
                <span>签名</span>
                <input
                  type="text"
                  placeholder="例如：hypn"
                  value={pSign}
                  onChange={(e) => setPSign(e.target.value)}
                />
              </label>
            </div>

            <button
              className="btn-pill prompt-copy-btn"
              onClick={() => {
                navigator.clipboard.writeText(portraitFilled)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}
            >
              {copied ? '已复制' : '复制提示词'}
            </button>

            <div className="prompt-output-wrap">
              <button
                className="prompt-output-copy"
                onClick={() => {
                  navigator.clipboard.writeText(portraitFilled)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2000)
                }}
              >
                复制
              </button>
              <pre className="prompt-output">{portraitFilled}</pre>
          </div>

          <p className="prompt-updated">最近更新：2026-07-18</p>
        </div>
        </section>

        <div className="section-divider" />

        {/* Step 4: Scene Card */}
        <section className="guide-section">
          <h2 className="section-heading">
            <span className="section-step">04</span>
            场景卡提示词
          </h2>
          <p className="guide-desc">
            同时上传<strong>完整场景</strong>（剧照、电影帧、动漫截图）和<strong>一张模板图</strong>（基础/SR/SSR）作为参考图。
            AI 将忠实还原整个构图，并套用你选择的模板卡框样式。
            填写下方字段，一键生成专属提示词。
          </p>

          <div className="prompt-gen">
            <div className="prompt-fields">
              <label className="prompt-field">
                <span>编号</span>
                <input
                  type="text"
                  placeholder="例如：SU-001"
                  value={sNumber}
                  onChange={(e) => setSNumber(e.target.value)}
                />
              </label>
              <label className="prompt-field">
                <span>签名</span>
                <input
                  type="text"
                  placeholder="例如：hypn"
                  value={sSign}
                  onChange={(e) => setSSign(e.target.value)}
                />
              </label>
            </div>

            <button
              className="btn-pill prompt-copy-btn"
              onClick={() => {
                navigator.clipboard.writeText(sceneFilled)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}
            >
              {copied ? '已复制' : '复制提示词'}
            </button>

            <div className="prompt-output-wrap">
              <button
                className="prompt-output-copy"
                onClick={() => {
                  navigator.clipboard.writeText(sceneFilled)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2000)
                }}
              >
                复制
              </button>
              <pre className="prompt-output">{sceneFilled}</pre>
          </div>

          <p className="prompt-updated">最近更新：2026-07-18</p>
        </div>
        </section>

        <div className="section-divider" />

        {/* Step 5: Full Art Card */}
        <section className="guide-section">
          <h2 className="section-heading">
            <span className="section-step">05</span>
            全画卡面提示词
          </h2>
          <p className="guide-desc">
            同时上传<strong>人物/场景参考图</strong>和<strong>全画卡模板</strong>作为参考图。
            AI 将生成无边框全幅插画卡牌，画面从边缘到边缘完整填满，仅保留微小签名和编号。
            填写下方字段，一键生成专属提示词。
          </p>

          <div className="prompt-gen">
            <div className="prompt-fields">
              <label className="prompt-field">
                <span>编号</span>
                <input
                  type="text"
                  placeholder="例如：SU-001"
                  value={fNumber}
                  onChange={(e) => setFNumber(e.target.value)}
                />
              </label>
              <label className="prompt-field">
                <span>签名</span>
                <input
                  type="text"
                  placeholder="例如：hypn"
                  value={fSign}
                  onChange={(e) => setFSign(e.target.value)}
                />
              </label>
            </div>

            <button
              className="btn-pill prompt-copy-btn"
              onClick={() => {
                navigator.clipboard.writeText(fullartFilled)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}
            >
              {copied ? '已复制' : '复制提示词'}
            </button>

            <div className="prompt-output-wrap">
              <button
                className="prompt-output-copy"
                onClick={() => {
                  navigator.clipboard.writeText(fullartFilled)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2000)
                }}
              >
                复制
              </button>
              <pre className="prompt-output">{fullartFilled}</pre>
          </div>

          <p className="prompt-updated">最近更新：2026-07-19</p>
        </div>
        </section>

        <div className="section-divider" />

        {/* Step 6: 生成流程 */}
        <section className="guide-section">
          <h2 className="section-heading">
            <span className="section-step">06</span>
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
              粘贴对应的提示词（人物卡、场景卡或全画卡），点击生成
            </li>
          </ol>
        </section>

        <div className="section-divider" />

        {/* Step 7: Card Back */}
        <section className="guide-section">
          <h2 className="section-heading">
            <span className="section-step">07</span>
            卡背
          </h2>
          <p className="guide-desc">
            卡背设计对所有卡牌通用。将
            <code>public/images/cards/back.png</code> 替换为你自己的设计即可。
          </p>
        </section>

        <div className="section-divider" />

        {/* Step 8: Tips */}
        <section className="guide-section">
          <h2 className="section-heading">
            <span className="section-step">08</span>
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
