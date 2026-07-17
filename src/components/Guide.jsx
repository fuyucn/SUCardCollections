import './Guide.css'

const prompt_zh = `生成一张 9:16 竖版收藏卡牌。

【卡面设计】
- 比例：9:16 竖版
- 背景：深色渐变底，带精致花纹边框
- 中央：主体插画
- 底部：编号区域（留空，后续填入三位数字如 001）

【风格要求】
- 精美插画风格
- 高细节、高质感
- 统一色调氛围

【编号】
待填入：___`

const prompt_en = `Generate a 9:16 vertical trading card.

【Card Design】
- Aspect ratio: 9:16 portrait
- Background: dark gradient with ornate border
- Center: main illustration
- Bottom: number area (leave blank, to be filled with 001, 002, etc.)

【Style】
- Premium illustration style
- High detail, high quality
- Consistent color tone

【Number】
To fill: ___`

const templates = [
  {
    name: '基础版',
    desc: '通用深色底，适合大多数卡面',
    src: '/templates/card-base.png',
    download: 'sucard-template-base.png',
  },
  {
    name: 'SR 版',
    desc: '银白梦幻边框，适合稀有卡',
    src: '/templates/card-sr.png',
    download: 'sucard-template-sr.png',
  },
  {
    name: 'SSR 版',
    desc: '金色华丽边框，适合超稀有卡',
    src: '/templates/card-ssr.png',
    download: 'sucard-template-ssr.png',
  },
]

export default function Guide({ onBack }) {
  return (
    <div className="guide-page">
      <header className="guide-header">
        <button className="back-btn" onClick={onBack}>&larr; 返回收藏</button>
        <h1>如何制作一张 SuCard</h1>
      </header>

      <main className="guide-content">
        {/* Step 1: Templates */}
        <section className="guide-section">
          <h2>1. 下载卡面模板</h2>
          <p className="guide-desc">
            三种不同风格的空白卡面模板，可直接在豆包等 AI 工具中作为参考或叠加使用。
          </p>
          <div className="template-grid">
            {templates.map((t) => (
              <div className="template-card" key={t.name}>
                <div className="template-preview">
                  <img src={t.src} alt={`${t.name} 模板`} />
                </div>
                <div className="template-info">
                  <h3>{t.name}</h3>
                  <p>{t.desc}</p>
                  <a
                    className="download-btn"
                    href={t.src}
                    download={t.download}
                  >
                    下载模板
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Step 2: Template Specs */}
        <section className="guide-section">
          <h2>2. 卡面规格</h2>
          <div className="spec-grid">
            <div className="spec-item">
              <span className="spec-label">比例</span>
              <span className="spec-value">9 : 16</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">建议尺寸</span>
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

        {/* Step 3: AI Generation */}
        <section className="guide-section">
          <h2>3. 使用豆包生成卡面</h2>
          <p className="guide-desc">
            在<strong>豆包</strong>中使用以下提示词，可批量生成统一风格的卡牌插图。
            每张卡的主体不同（角色、场景、物品等），但保持一致的画风和色调。
          </p>

          <div className="prompt-card">
            <div className="prompt-header">
              <h3>中文提示词</h3>
              <button
                className="copy-btn"
                onClick={() => navigator.clipboard.writeText(prompt_zh)}
              >
                复制
              </button>
            </div>
            <pre className="prompt-code">{prompt_zh}</pre>
          </div>

          <div className="prompt-card">
            <div className="prompt-header">
              <h3>English Prompt</h3>
              <button
                className="copy-btn"
                onClick={() => navigator.clipboard.writeText(prompt_en)}
              >
                Copy
              </button>
            </div>
            <pre className="prompt-code">{prompt_en}</pre>
          </div>
        </section>

        {/* Step 4: Numbering + Upload */}
        <section className="guide-section">
          <h2>4. 编号与上传</h2>
          <ol className="step-list">
            <li>导出图片为 PNG 格式</li>
            <li>按三位数字命名：<code>001.png</code>、<code>002.png</code> … <code>050.png</code></li>
            <li>在 Cloudflare Dashboard → R2 → sucards-images → cards/ 目录上传</li>
            <li>等待 60 秒，刷新页面即可看到新卡</li>
          </ol>
        </section>

        {/* Step 5: Card Back */}
        <section className="guide-section">
          <h2>5. 卡牌背面</h2>
          <p className="guide-desc">
            卡牌背面是统一的，所有卡片共用。将你的背面设计替换仓库中的
            <code>public/images/cards/back.png</code> 文件即可。
          </p>
        </section>

        {/* Step 6: Tips */}
        <section className="guide-section">
          <h2>6. 小技巧</h2>
          <ul className="step-list">
            <li>保持所有卡面<strong>统一画风</strong>和色调，收藏感更强</li>
            <li>每张卡的主体建议有明显视觉差异，翻转时才有惊喜感</li>
            <li>背面设计建议用对称图案，方便识别但保留神秘感</li>
            <li>建议先做 5-10 张统一风格的卡，然后再逐步扩充</li>
          </ul>
        </section>
      </main>
    </div>
  )
}
