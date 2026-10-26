import { useEffect, useState } from 'react'
import { api } from '../api.js'

export default function History() {
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
        <div className="meta"><span className="mono">{detail.day}</span><span className="chip">Closed</span></div>
        <h2 className="label">Closing balances</h2>
        <div className="rows">
          {detail.closing.map((c) => (
            <div className="line" key={c.id}><span>{c.name}</span><span className="amt">{c.real}</span></div>
          ))}
        </div>
        <h2 className="label">Logs</h2>
        {!detail.logs.length && <p className="muted">No logs that day.</p>}
        <div className="rows">
          {detail.logs.map((l) => (
            <div className="line" key={l.id}>
              <div className="grow">{l.expense}<small>{l.description}</small></div>
              <span className="amt">−{l.amount}</span>
            </div>
          ))}
        </div>
        <div className="actions"><button className="secondary" onClick={() => setDetail(null)}>All days</button></div>
      </section>
    )

  return (
    <section>
      <h2 className="label">Closed days</h2>
      {!days.length && <p className="muted">No closed days yet. Close your first day from Home.</p>}
      <div className="rows">
        {days.map((d) => (
          <button key={d.day} className="line link-row" onClick={() => open(d.day)}>
            <span className="mono">{d.day}</span><span className="muted">View →</span>
          </button>
        ))}
      </div>
    </section>
  )
}
