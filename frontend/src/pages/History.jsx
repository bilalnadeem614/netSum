import { useEffect, useState } from 'react'
import { api } from '../api.js'

export default function History({ onBack }) {
  const [days, setDays] = useState(null)
  const [detail, setDetail] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api('/days').then(setDays).catch((e) => setError(e.message))
  }, [])

  const open = (day) => api(`/days/${day}`).then(setDetail).catch((e) => setError(e.message))

  if (error) return <p className="banner">{error}</p>
  if (!days) return <p className="muted">Loading…</p>

  if (detail)
    return (
      <section>
        <p className="muted">{detail.day} · closed</p>
        <h2>Closing balances</h2>
        {detail.closing.map((c) => (
          <div className="row" key={c.id}>
            <span>{c.name}</span>
            <strong className="num sm">{c.real}</strong>
          </div>
        ))}
        <h2 className="gap">Logs</h2>
        {!detail.logs.length && <p className="muted">No logs that day.</p>}
        {detail.logs.map((l) => (
          <div className="row log" key={l.id}>
            <span>
              {l.expense}
              <small className="muted">{l.description && ` · ${l.description}`}</small>
            </span>
            <strong className="num sm">-{l.amount}</strong>
          </div>
        ))}
        <button className="ghost" onClick={() => setDetail(null)}>Back</button>
      </section>
    )

  return (
    <section>
      <h2>History</h2>
      {!days.length && <p className="muted">No closed days yet.</p>}
      {days.map((d) => (
        <div className="row log" key={d.day}>
          <span>{d.day}</span>
          <button className="ghost" onClick={() => open(d.day)}>View</button>
        </div>
      ))}
      <button className="ghost" onClick={onBack}>Back</button>
    </section>
  )
}
