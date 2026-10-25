import { useEffect, useState } from 'react'
import { api } from '../api.js'

export default function CloseDay({ onClosed, onBack }) {
  const [preview, setPreview] = useState(null)
  const [real, setReal] = useState({})
  const [diff, setDiff] = useState({}) // method_id -> difference, set after a blocked close
  const [error, setError] = useState('')

  useEffect(() => {
    api('/close-preview').then(setPreview).catch((e) => setError(e.message))
  }, [])

  async function close() {
    setError('')
    try {
      await api('/close-day', { real })
      onClosed()
    } catch (e) {
      if (e.status === 409) setDiff(e.data.detail.differences)
      else setError(e.message)
    }
  }

  if (!preview) return error ? <p className="banner">{error}</p> : <p className="muted">Loading…</p>

  const filled = preview.methods.every((m) => real[m.id] !== undefined && real[m.id] !== '')
  const blocked = Object.keys(diff).length > 0

  return (
    <section>
      <p className="muted">Close {preview.day}</p>
      <h2>Count what you really have</h2>
      {preview.methods.map((m) => {
        const bad = diff[m.id] !== undefined
        return (
          <div className={`row close ${bad ? 'bad' : ''}`} key={m.id}>
            <span>
              {m.name}
              <small className="muted"> calculated {m.calculated}</small>
            </span>
            <input
              type="number" step="0.01" inputMode="decimal" placeholder="Real"
              value={real[m.id] ?? ''}
              onChange={(e) => { setReal({ ...real, [m.id]: e.target.value }); setDiff({}) }}
            />
            {bad && <strong className="red">Difference: {diff[m.id]}</strong>}
          </div>
        )
      })}
      <p className="muted">Total calculated: {preview.total}</p>
      {blocked && <p className="banner">Day not closed. Add or edit logs, then try again.</p>}
      {error && <p className="banner">{error}</p>}
      <button disabled={!filled} onClick={close}>Close day</button>
      <button className="ghost" onClick={onBack}>Back</button>
    </section>
  )
}
