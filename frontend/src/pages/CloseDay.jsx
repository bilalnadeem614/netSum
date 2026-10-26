import { useEffect, useState } from 'react'
import { api } from '../api.js'
import Loading from '../components/Loading.jsx'
import MoneyInput, { isMoney } from '../components/MoneyInput.jsx'

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

  if (!preview) return error ? <p className="banner">{error}</p> : <Loading />

  const filled = preview.methods.every((m) => isMoney(real[m.id] ?? ''))
  const blocked = Object.keys(diff).length > 0

  return (
    <section>
      <div className="meta"><span className="mono">{preview.day}</span><span className="chip">Closing</span></div>
      <h1>Count what you actually have</h1>
      <p className="muted">Enter the real balance of each method. The day closes only when every one matches.</p>
      <div className="rows">
        {preview.methods.map((m) => {
          const bad = diff[m.id] !== undefined
          return (
            <div className={`close-row ${bad ? 'bad' : ''}`} key={m.id}>
              <div className="top">
                <span>{m.name}</span>
                <span className="muted">calculated <span className="amt">{m.calculated}</span></span>
              </div>
              <MoneyInput
                placeholder="Real balance" aria-label={`Real balance for ${m.name}`}
                value={real[m.id] ?? ''}
                onChange={(v) => { setReal({ ...real, [m.id]: v }); setDiff({}) }}
              />
              {bad && <div className="diff">Difference: <span className="mono">{diff[m.id]}</span></div>}
            </div>
          )
        })}
      </div>
      <p className="muted" style={{ marginTop: 12 }}>Total calculated <span className="amt">{preview.total}</span></p>
      {blocked && <p className="banner">Day not closed. Add or edit logs, then try again.</p>}
      {error && <p className="banner">{error}</p>}
      <div className="actions">
        <button disabled={!filled} onClick={close}>Close day</button>
        <button className="secondary" onClick={onBack}>Back</button>
      </div>
    </section>
  )
}
