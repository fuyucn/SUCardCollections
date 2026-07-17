import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Upload.css'

export default function Upload() {
  // ── 表单状态 ──
  const [password, setPassword] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [status, setStatus] = useState(null) // { type: 'idle'|'uploading'|'success'|'error', message }
  const [occupiedNums, setOccupiedNums] = useState(new Set())
  const fileInputRef = useRef(null)

  // ── 加载已占用卡号 ──
  useEffect(() => {
    fetch('/api/cards')
      .then((res) => res.json())
      .then((cards) => {
        const occupied = new Set()
        cards.forEach((c) => {
          if (c.has_card) occupied.add(c.card_number)
        })
        setOccupiedNums(occupied)
      })
      .catch(() => {})
  }, [])

  // ── 文件选择 ──
  function handleFileChange(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    const url = URL.createObjectURL(f)
    setPreview(url)
    setStatus(null)
  }

  function handleDrop(e) {
    e.preventDefault()
    const f = e.dataTransfer?.files?.[0]
    if (!f) return
    setFile(f)
    const url = URL.createObjectURL(f)
    setPreview(url)
    setStatus(null)
  }

  function handleDragOver(e) {
    e.preventDefault()
  }

  function clearFile() {
    setFile(null)
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ── 上传 ──
  async function handleUpload() {
    if (!password) {
      setStatus({ type: 'error', message: '请输入密码' })
      return
    }
    const num = parseInt(cardNumber, 10)
    if (isNaN(num) || num < 1 || num > 50) {
      setStatus({ type: 'error', message: '卡号必须在 1–50 之间' })
      return
    }
    if (!file) {
      setStatus({ type: 'error', message: '请选择卡面图片' })
      return
    }

    setStatus({ type: 'uploading', message: '上传中…' })

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('number', cardNumber)

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'x-upload-password': password },
        body: formData,
      })

      const data = await res.json()

      if (res.ok) {
        setStatus({
          type: 'success',
          message: `卡牌 #${data.card_number} 上传成功！60 秒内将在首页刷新。`,
        })
        clearFile()
      } else {
        setStatus({ type: 'error', message: data.error || '上传失败' })
      }
    } catch (err) {
      setStatus({ type: 'error', message: `网络错误: ${err.message}` })
    }
  }

  // ── 当前占用的卡号 ──
  const occupiedSlots = [] // 后续可从 API 获取

  return (
    <div className="upload-page">
      {/* Nav */}
      <nav className="nav-bar">
        <Link to="/" className="logo">SuCards</Link>
        <div className="nav-actions">
          <Link to="/guide" className="btn-pill btn-pill-sm">指南</Link>
          <Link to="/" className="btn-pill btn-pill-sm">画廊</Link>
        </div>
      </nav>

      <section className="upload-hero">
        <p className="hero-eyebrow">管理后台</p>
        <h1>上传卡面</h1>
        <p className="hero-sub">将生成的卡牌图片上传到收藏库，需要密码验证</p>
      </section>

      <div className="divider" />

      <main className="upload-main">
        <div className="upload-card">
          {/* ── 密码 ── */}
          <label className="upload-field">
            <span className="upload-label">
              上传密码 <em className="required">*</em>
            </span>
            <input
              type="password"
              className="upload-input"
              placeholder="请输入上传密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="off"
            />
          </label>

          {/* ── 卡号 ── */}
          <label className="upload-field">
            <span className="upload-label">
              卡牌编号 <em className="required">*</em>
            </span>
            <input
              type="number"
              className={`upload-input${cardNumber && occupiedNums.has(parseInt(cardNumber)) ? ' upload-input--occupied' : ''}`}
              placeholder="1–50"
              min={1}
              max={50}
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
            />
            {cardNumber && occupiedNums.has(parseInt(cardNumber)) ? (
              <span className="upload-hint upload-hint--warn">
                该编号已被占用，不能覆盖。请选择其他编号。
              </span>
            ) : (
              <span className="upload-hint">
                三位补零。例如输入 7 将存为 007.png
              </span>
            )}
            </span>
          </label>

          {/* ── 文件上传区 ── */}
          <div className="upload-field">
            <span className="upload-label">
              卡面图片 <em className="required">*</em>
            </span>
            <div
              className={`upload-dropzone${file ? ' has-file' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              {preview ? (
                <div className="upload-preview-wrap">
                  <img src={preview} alt="预览" className="upload-preview" />
                  <button
                    type="button"
                    className="upload-preview-remove"
                    onClick={(e) => {
                      e.stopPropagation()
                      clearFile()
                    }}
                  >
                    移除
                  </button>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <span className="upload-placeholder-icon">+</span>
                  <p>拖拽图片到此处，或点击选择</p>
                  <p className="upload-hint">支持 PNG / JPEG / WebP</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileChange}
                className="upload-file-input"
              />
            </div>
          </div>

          {/* ── 提交 ── */}
          <button
            className="upload-submit"
            onClick={handleUpload}
            disabled={status?.type === 'uploading'}
          >
            {status?.type === 'uploading' ? '上传中…' : '上传卡面'}
          </button>

          {/* ── 状态反馈 ── */}
          {status && (
            <div className={`upload-status upload-status--${status.type}`}>
              {status.type === 'success' && <span className="status-icon">&#10003;</span>}
              {status.type === 'error' && <span className="status-icon">&#10007;</span>}
              {status.type === 'uploading' && <span className="status-icon spinner-sm" />}
              {status.message}
            </div>
          )}
        </div>
      </main>

      <footer className="footer">
        <p>SuCards 管理后台 · Cloudflare Pages</p>
      </footer>
    </div>
  )
}
