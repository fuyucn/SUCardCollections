import { useState, useEffect } from 'react'
import './AuthGuard.css'

const STORAGE_KEY = 'sucards_auth'
const TTL_MS = 7 * 24 * 60 * 60 * 1000

function getStoredExpires() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (data.expires && Date.now() < data.expires) {
      return data.expires
    }
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* corrupt — clean up */
    localStorage.removeItem(STORAGE_KEY)
  }
  return null
}

export default function AuthGuard({ children }) {
  const [authed, setAuthed] = useState(false)
  const [checking, setChecking] = useState(true)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // 页面加载：检查是否在有效期内
  useEffect(() => {
    if (getStoredExpires()) {
      setAuthed(true)
    }
    setChecking(false)
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    const pwd = password.trim()
    if (!pwd) {
      setError('请输入密码')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/verify', {
        headers: { 'x-upload-password': pwd },
      })
      if (res.ok) {
        // 只存过期时间戳，不存密码
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ expires: Date.now() + TTL_MS })
        )
        setAuthed(true)
      } else {
        setError('密码错误')
      }
    } catch {
      setError('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 加载中不渲染
  if (checking) return null

  // 已验证 → 放行
  if (authed) return children

  // 验证页面
  return (
    <div className="auth-screen">
      <div className="auth-card">
        <p className="auth-eyebrow">SuCards</p>
        <h1 className="auth-title">访问验证</h1>
        <p className="auth-sub">请输入访问密码</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="password"
            className="auth-input"
            placeholder="访问密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            autoComplete="off"
          />
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? '验证中…' : '验证'}
          </button>
        </form>
        {error && <p className="auth-error">{error}</p>}
      </div>
    </div>
  )
}
