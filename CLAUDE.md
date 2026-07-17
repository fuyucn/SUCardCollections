# SuCards — AI 卡牌收藏展示网站

## 项目概述

SuCards 是一个个人卡牌收藏画廊，托管在 **Cloudflare Pages（完全免费）**。
- 50 张编号 #1–#50 的 9:16 竖版卡牌
- 卡牌正面图片存储在 **Cloudflare R2**（`sucards-images` bucket）
- 卡牌背面统一使用 `public/images/cards/back.png`
- 通过 **Pages Functions** 代理 R2 图片（不暴露 R2 公网）
- 点击卡片可 **3D 翻转** 查看正反面
- 自动扫描 R2 检测哪些卡片已存在
- 附带 **制作指南页面**（如何用豆包生成卡面、下载模板、上传）

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 18 + Vite 5 |
| 后端 | Cloudflare Pages Functions（`functions/` 目录） |
| 存储 | Cloudflare R2（Bucket: `sucards-images`） |
| 部署 | Cloudflare Pages + Wrangler CLI |
| 包管理 | npm + ES Modules |

**零运行时依赖** — 仅 `react` + `react-dom`，无任何 UI 库或 CSS 框架。

## 项目结构

```
sucards/
├── index.html                  # HTML 入口（Vite 注入）
├── package.json                # 脚本: dev / build / preview / deploy
├── vite.config.js              # Vite 配置
├── wrangler.toml               # Cloudflare Pages + R2 绑定
│
├── public/                     # 静态资源（直接映射 URL 根）
│   ├── favicon.svg
│   ├── images/cards/back.png   # 统一卡背（6.56 MB）
│   └── templates/              # 可下载的卡面模板 PNG
│
├── functions/                  # Cloudflare Pages Functions（服务端 API）
│   └── api/
│       ├── cards/index.js      # GET /api/cards — 扫描 R2 返回卡片列表
│       └── images/[filename].js # GET /api/images/{xxx}.png — R2 图片代理
│
├── src/                        # React 前端源码
│   ├── main.jsx                # React 入口
│   ├── App.jsx                 # 根组件（状态管理 + Header + 路由逻辑）
│   ├── App.css                 # 全局样式 + Header/Footer
│   ├── api.js                  # 前端 API 调用（fetchCards）
│   ├── data/cards.js           # 静态兜底数据（50 张卡）
│   └── components/
│       ├── CardGrid.jsx        # 卡片网格容器
│       ├── CardGrid.css        # CSS Grid 响应式布局
│       ├── Card.jsx            # 单张卡片（翻转逻辑 + 空卡占位）
│       ├── Card.css            # 3D 翻转动画 + 卡面样式
│       ├── Guide.jsx           # 制作指南页面
│       └── Guide.css           # 指南页面样式
│
└── dist/                       # Vite 构建产物（部署目录）
```

## 数据流

```
用户访问页面
  → App.jsx useEffect → api.fetchCards()
    → GET /api/cards (Functions)
      → env.CARDS_BUCKET.list({ prefix: 'cards/' })
      → 扫描 R2 中 cards/ 目录，正则匹配 cards/{nnn}.png
      → 生成 #1–#50 数组，has_card 标记是否存在
      → 返回 JSON，Cache-Control: max-age=60
    → 失败时回退到 data/cards.js 静态数据
```

```
卡牌正面图片请求
  → <img src="/api/images/001.png" />
    → functions/api/images/[filename].js
      → env.CARDS_BUCKET.get("cards/001.png")
      → 返回图片 + Cache-Control: public, max-age=31536000, immutable
```

```
卡牌背面图片
  → <img src="/images/cards/back.png" />
    → 直接走 public/ 静态文件（不走 Functions）
```

## wrangler.toml 关键配置

```toml
name = "sucards"
pages_build_output_dir = "dist"

[[r2_buckets]]
binding = "CARDS_BUCKET"
bucket_name = "sucards-images"
```

- `pages_build_output_dir` 指向 Vite 构建输出 `dist/`
- `CARDS_BUCKET` 绑定在 Functions 中通过 `env.CARDS_BUCKET` 访问

## 组件架构

```
App（根组件）
├── loading → 全屏 spinner
├── error → 错误提示 + Retry
├── showGuide → <Guide onBack={...} />  （制作指南页）
└── 正常 → header + <CardGrid>
              └── <Card> × 50
                    ├── has_card=false → 灰色占位 "暂无"
                    └── has_card=true → 可点击翻转
                          ├── 正面: <img src="/api/images/{NNN}.png" />
                          └── 背面: <img src="/images/cards/back.png" />
```

**注意**: Header 不是独立组件，JSX 直接写在 `App.jsx` 中，样式在 `App.css`。

## 卡片翻转机制

纯 CSS 3D Transform，无 JS 动画库：

1. `useState(false)` 控制 `flipped` 状态
2. 点击切换 → `.card-inner` 添加/移除 `.is-flipped` 类
3. `.is-flipped` → `transform: rotateY(180deg)`，`transition: 0.6s`
4. 正反面均设 `backface-visibility: hidden`，初始正面已预旋转 180°

## 代码约定

### CSS 命名
- 纯手动 BEM 风格：`.card-wrapper` / `.card-wrapper.is-empty` / `.card-face.card-front`
- 无 CSS Modules、Tailwind
- 全局重置在 `App.css` 顶部

### 设计规范
- **主题**: 深色背景 `#0a0a14`，紫色系主色调 `#667eea` / `#c8a4f0`
- **字体**: 系统 sans-serif，代码 `SF Mono / Fira Code`
- **圆角**: 8–12px，按钮用胶囊形
- **响应式断点**: 480px / 768px / 1400px
- **卡片网格**: `grid-template-columns: repeat(auto-fill, minmax(170px, 1fr))`

### 图片命名
- R2 中: `cards/001.png` … `cards/050.png`（三位数字补零）
- API 路径: `/api/images/001.png`
- 本地模板: `public/templates/card-base.png` / `card-sr.png` / `card-ssr.png`

### Functions 注意事项
- 使用 `onRequest` handler 而非 `onRequestGet`（兼容性更好）
- 每个 endpoint 必须放在独立目录下的 `index.js` 才能正确路由
- 通过 `env` 而非 `context.env` 访问 bindings

## 部署

```bash
npm run deploy          # vite build + wrangler pages deploy
# 或手动:
npm run build           # vite build → dist/
# Cloudflare Pages 自动从 GitHub main 分支部署
```

1. **Git 自动部署**: 推送到 `main` → Cloudflare Pages 自动构建部署
2. **构建命令**: `npm run build`（需在 Cloudflare Dashboard 配置）
3. **输出目录**: `dist`
4. **自定义域名**: `https://sucards.pages.dev`

## 常见开发任务

### 添加新卡牌
将 PNG 上传到 Cloudflare Dashboard → R2 → `sucards-images` → `cards/` 目录，命名为 `NNN.png`（三位补零），60 秒内自动出现在页面。

### 修改卡牌背面
替换 `public/images/cards/back.png`，提交后自动部署。

### 添加新模板
放入 `public/templates/`，在 `Guide.jsx` 的 `templates` 数组中注册。

### 调整卡片显示数量
修改 `functions/api/cards/index.js` 和 `src/data/cards.js` 中的 `50`，确保一致。
