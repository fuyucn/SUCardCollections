import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Upload.css'

export default function Upload() {
  // ── 两步验证状态 ──
  const [password, setPassword] = useState('')
  const [verified, setVerified] = useState(false)   // 第一步：密码已验证通过
  const [verifying, setVerifying] = useState(false)  // 正在验证中

  // ── 表单状态 ──
  const [cardNumber, setCardNumber] = useState('')
  const [file, setFile] = useState(null)        // 本地上传文件
  const [preview, setPreview] = useState(null)  // 预览地址（本地 blob 或远程 URL）
  const [urlValue, setUrlValue] = useState('')  // URL 输入框
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
    setUrlValue('')
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ── URL 输入：粘贴地址 → 预览 ──
  function handleUrlChange(e) {
    const val = e.target.value.trim()
    setUrlValue(val)
    // 清除本地文件，避免与 URL 冲突
    if (file) {
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
    // 合法 http(s) 地址 → 直接预览
    if (/^https?:\/\/\S+$/i.test(val)) {
      setPreview(val)
    } else {
      setPreview(null)
    }
    setStatus(null)
  }

  // ── 第一步：验证密码 ──
  async function handleVerify() {
    if (!password) {
      setStatus({ type: 'error', message: '请输入密码' })
      return
    }

    setVerifying(true)
    setStatus(null)

    try {
      const res = await fetch('/api/verify', {
        method: 'GET',
        headers: { 'x-upload-password': password },
      })

      if (res.ok) {
        setVerified(true)
        setStatus({ type: 'success', message: '密码验证通过，请选择卡号并上传卡面' })
      } else {
        setStatus({ type: 'error', message: '密码错误，请重试' })
      }
    } catch (err) {
      setStatus({ type: 'error', message: `网络错误: ${err.message}` })
    } finally {
      setVerifying(false)
    }
  }

  // ── 第二步：上传（后端二次验证密码） ──
  async function handleUpload() {
    const num = parseInt(cardNumber, 10)
    if (isNaN(num) || num < 11 || num > 999) {
      setStatus({ type: 'error', message: '卡号必须在 11–999 之间，前 10 张不允许修改' })
      return
    }
    // 文件或 URL 至少提供一个
    if (!file && !urlValue) {
      setStatus({ type: 'error', message: '请选择卡面图片或粘贴图片链接' })
      return
    }

    setStatus({ type: 'uploading', message: '上传中…' })

    try {
      let res
      if (file) {
        // ── 方式一：本地文件上传 ──
        const formData = new FormData()
        formData.append('file', file)
        formData.append('number', cardNumber)
        res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'x-upload-password': password },
          body: formData,
        })
      } else {
        // ── 方式二：URL 直传 ──
        res = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'x-upload-password': password,
            'content-type': 'application/json',
          },
          body: JSON.stringify({ url: urlValue, number: cardNumber }),
        })
      }

      const data = await res.json()

      if (res.ok) {
        setStatus({
          type: 'success',
          message: `卡牌 #${data.card_number} 上传成功！60 秒内将在首页刷新。`,
        })
        // 标记该编号已占用
        setOccupiedNums((prev) => new Set([...prev, data.card_number]))
        clearFile()
        setCardNumber('')
      } else {
        setStatus({ type: 'error', message: data.error || '上传失败' })
      }
    } catch (err) {
      setStatus({ type: 'error', message: `网络错误: ${err.message}` })
    }
  }

  // ── 回车验证密码 ──
  function handlePasswordKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleVerify()
    }
  }

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
        <p className="hero-sub">
          {verified
            ? '选择卡号并上传卡面图片'
            : '请输入上传密码进行验证'}
        </p>
      </section>

      <div className="divider" />

      <main className="upload-main">
        <div className="upload-card">
          {/* ══════════════════════ 第一步：密码验证 ══════════════════════ */}
          <label className="upload-field">
            <span className="upload-label">
              上传密码 <em className="required">*</em>
            </span>
            <div className="upload-password-row">
              <input
                type="password"
                className={`upload-input${verified ? ' upload-input--ok' : ''}`}
                placeholder="请输入上传密码"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  // 密码被修改时重置验证状态
                  if (verified) {
                    setVerified(false)
                    setStatus(null)
                  }
                }}
                onKeyDown={handlePasswordKeyDown}
                autoComplete="off"
                disabled={verified}
              />
              {!verified ? (
                <button
                  className="upload-verify-btn"
                  onClick={handleVerify}
                  disabled={verifying}
                >
                  {verifying ? '验证中…' : '验证'}
                </button>
              ) : (
                <span className="upload-verified-badge">已通过</span>
              )}
            </div>
          </label>

          {/* ══════════════════════ 第二步：上传表单（验证通过后才可见） ══════════════════════ */}
          {verified && (
            <>
              <div className="divider divider--thin" />

              {/* ── 卡号 ── */}
              <label className="upload-field">
                <span className="upload-label">
                  卡牌编号 <em className="required">*</em>
                </span>
                <input
                  type="number"
                  className={`upload-input${cardNumber && occupiedNums.has(parseInt(cardNumber)) ? ' upload-input--occupied' : ''}`}
                  placeholder="11–999"
                  min={11}
                  max={999}
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                />
                {cardNumber && occupiedNums.has(parseInt(cardNumber)) ? (
                  <span className="upload-hint upload-hint--warn">
                    该编号已被占用，不能覆盖。请选择其他编号。
                  </span>
                ) : (
                  <span className="upload-hint">
                    三位补零。前 10 张受保护，可上传 11–999
                  </span>
                )}
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

                {/* ── 或：粘贴图片 URL ── */}
                <div className="upload-url-row">
                  <span className="upload-url-sep">或</span>
                  <input
                    type="url"
                    className={`upload-input upload-input--url${urlValue ? ' upload-input--url-filled' : ''}`}
                    placeholder="粘贴图片直链，如 https://example.com/card.png"
                    value={urlValue}
                    onChange={handleUrlChange}
                  />
                </div>
              </div>

              {/* ── 提交按钮 ── */}
              <button
                className="upload-submit"
                onClick={handleUpload}
                disabled={status?.type === 'uploading'}
              >
                {status?.type === 'uploading' ? '上传中…' : '上传卡面'}
              </button>
            </>
          )}

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
