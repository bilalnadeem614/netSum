import { useEffect, useState } from 'react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { api } from '../api.js'

export default function Loans({ onBack }) {
  const [loans, setLoans] = useState(null)
  const [f, setF] = useState({ name: '', total: '' })
  const [error, setError] = useState('')

  const load = () => api('/loans').then(setLoans).catch((e) => setError(e.message))
  useEffect(() => { load() }, [])

  const add = () =>
    api('/loans', [f]).then(() => { setF({ name: '', total: '' }); load() }).catch((e) => setError(e.message))

  if (!loans) return error ? <p className="banner">{error}</p> : <p className="muted">Loading…</p>

  const data = loans.map((l) => ({ name: l.name, paid: +l.paid, remaining: +l.remaining }))

  return (
    <section>
      <h2>Loans</h2>
      {!loans.length && <p className="muted">No loans.</p>}
      {loans.map((l) => (
        <div className="row log" key={l.id}>
          <span>{l.name}<small className="muted"> · owed {l.total} · paid {l.paid}</small></span>
          <strong className="num sm">{l.remaining}</strong>
        </div>
      ))}
      {!!loans.length && (
        <div className="chart">
          <ResponsiveContainer>
            <BarChart data={data} layout="vertical">
              <XAxis type="number" stroke="#8a9299" />
              <YAxis type="category" dataKey="name" stroke="#8a9299" width={70} />
              <Tooltip contentStyle={{ background: '#181b1e', border: '1px solid #2a2f33' }} />
              <Bar dataKey="paid" stackId="a" fill="#3fb97c" />
              <Bar dataKey="remaining" stackId="a" fill="#3a4147" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <h2 className="gap">Add loan</h2>
      <div className="row">
        <input placeholder="Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <input type="number" step="0.01" placeholder="Amount owed" value={f.total} onChange={(e) => setF({ ...f, total: e.target.value })} />
      </div>
      {error && <p className="banner">{error}</p>}
      <button disabled={!f.name.trim() || !(+f.total > 0)} onClick={add}>Add</button>
      <button className="ghost" onClick={onBack}>Back</button>
    </section>
  )
}
