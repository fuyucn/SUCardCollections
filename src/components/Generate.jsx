import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useSuCards } from '../SuCardContext'
import './Generate.css'

const RARITY_OPTIONS = [
  { value: 'N', label: 'N', desc: 'Normal' },
  { value: 'R', label: 'R', desc: 'Rare' },
  { value: 'SR', label: 'SR', desc: 'Super Rare' },
  { value: 'SSR', label: 'SSR', desc: 'Ultra Rare' },
]

const TYPE_OPTIONS = [
  { value: 'portrait', label: 'Portrait', desc: 'Character face card' },
  { value: 'scene', label: 'Scene', desc: 'Full scene card' },
]

const EMPTY_FORM = {
  name: '',
  character: '',
  number: '',
  rarity: 'N',
  type: 'portrait',
  description: '',
}

export default function Generate() {
  const navigate = useNavigate()
  const { addCard } = useSuCards()
  const fileRef = useRef(null)

  const [form, setForm] = useState(EMPTY_FORM)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageData, setImageData] = useState(null)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, image: 'Only image files are allowed' }))
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: 'Image must be under 10 MB' }))
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setImagePreview(reader.result)
      setImageData(reader.result)
      setErrors((prev) => {
        const next = { ...prev }
        delete next.image
        return next
      })
    }
    reader.readAsDataURL(file)
  }

  function validate() {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Card name is required'
    if (!form.character.trim()) errs.character = 'Character name is required'
    if (!form.number.trim()) {
      errs.number = 'Card number is required'
    } else if (!/^\d{3}$/.test(form.number.trim())) {
      errs.number = 'Must be 3 digits, e.g. 007'
    }
    if (!imageData) errs.image = 'Please upload a card image'
    return errs
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setSubmitting(true)

    // 模拟短暂延迟让用户看到反馈
    setTimeout(() => {
      const id = crypto.randomUUID()
      addCard({
        id,
        name: form.name.trim(),
        character: form.character.trim(),
        number: form.number.trim(),
        rarity: form.rarity,
        type: form.type,
        description: form.description.trim(),
        imageUrl: imageData,
        createdAt: new Date().toISOString(),
      })

      setSubmitting(false)
      navigate(`/card/${id}`)
    }, 600)
  }

  return (
    <div className="generate-page">
      {/* ── Nav Bar ── */}
      <nav className="nav-bar">
        <Link to="/" className="logo">SuCards</Link>
        <Link to="/" className="btn-pill btn-pill-sm">← Back</Link>
      </nav>

      {/* ── Hero ── */}
      <section className="hero" style={{ paddingBottom: '40px' }}>
        <p className="hero-eyebrow">Create</p>
        <h1 className="hero-title" style={{ fontSize: '48px', lineHeight: '48px', letterSpacing: '-1.2px' }}>
          Generate SuCard
        </h1>
        <p className="hero-sub" style={{ marginBottom: '0' }}>
          Design your own collectible card and share it via a unique URL
        </p>
      </section>

      <div className="divider" />

      {/* ── Form ── */}
      <main className="generate-content">
        <form onSubmit={handleSubmit} noValidate>
          {/* ── Image Upload ── */}
          <section className="form-section">
            <h2 className="section-heading">
              <span className="section-step">01</span>
              Card Image
            </h2>

            <div className="image-upload-area">
              <div
                className={`image-dropzone ${imagePreview ? 'has-image' : ''} ${errors.image ? 'has-error' : ''}`}
                onClick={() => fileRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') fileRef.current?.click()
                }}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Card preview" className="image-preview" />
                ) : (
                  <div className="upload-placeholder">
                    <span className="upload-icon">+</span>
                    <p>Click to upload card image</p>
                    <p className="upload-hint">PNG, JPG · Max 10 MB</p>
                  </div>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                hidden
              />
              {errors.image && <p className="field-error">{errors.image}</p>}
            </div>
          </section>

          <div className="section-divider" />

          {/* ── Card Info ── */}
          <section className="form-section">
            <h2 className="section-heading">
              <span className="section-step">02</span>
              Card Info
            </h2>

            <div className="form-grid">
              <div className={`field ${errors.name ? 'has-error' : ''}`}>
                <label className="field-label" htmlFor="card-name">Card Name</label>
                <input
                  id="card-name"
                  className="field-input"
                  type="text"
                  placeholder="e.g. Dragon Slayer"
                  value={form.name}
                  onChange={set('name')}
                  maxLength={40}
                />
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>

              <div className={`field ${errors.character ? 'has-error' : ''}`}>
                <label className="field-label" htmlFor="card-character">Character</label>
                <input
                  id="card-character"
                  className="field-input"
                  type="text"
                  placeholder="e.g. Kael Firebrand"
                  value={form.character}
                  onChange={set('character')}
                  maxLength={30}
                />
                {errors.character && <span className="field-error">{errors.character}</span>}
              </div>

              <div className={`field ${errors.number ? 'has-error' : ''}`}>
                <label className="field-label" htmlFor="card-number">Card Number</label>
                <input
                  id="card-number"
                  className="field-input mono"
                  type="text"
                  placeholder="007"
                  value={form.number}
                  onChange={set('number')}
                  maxLength={3}
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
                {errors.number && <span className="field-error">{errors.number}</span>}
              </div>

              <div className="field">
                <label className="field-label" htmlFor="card-rarity">Rarity</label>
                <select
                  id="card-rarity"
                  className="field-select"
                  value={form.rarity}
                  onChange={set('rarity')}
                >
                  {RARITY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label} — {o.desc}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="field-label" htmlFor="card-type">Card Type</label>
                <select
                  id="card-type"
                  className="field-select"
                  value={form.type}
                  onChange={set('type')}
                >
                  {TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label} — {o.desc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field" style={{ marginTop: '16px' }}>
              <label className="field-label" htmlFor="card-desc">Description (optional)</label>
              <textarea
                id="card-desc"
                className="field-textarea"
                placeholder="A short story or flavor text for your card…"
                value={form.description}
                onChange={set('description')}
                rows={3}
                maxLength={200}
              />
            </div>
          </section>

          <div className="section-divider" />

          {/* ── Actions ── */}
          <div className="form-actions">
            <Link to="/" className="btn-pill">Cancel</Link>
            <button
              type="submit"
              className="btn-pill btn-pill-primary"
              disabled={submitting}
            >
              {submitting ? 'Creating…' : 'Create SuCard →'}
            </button>
          </div>
        </form>
      </main>

      {/* ── Footer ── */}
      <footer className="footer">
        <p>SuCards · Create &amp; Collect</p>
      </footer>
    </div>
  )
}
