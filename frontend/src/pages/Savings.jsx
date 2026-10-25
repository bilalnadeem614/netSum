import { useEffect, useState } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { api } from '../api.js'

export default function Savings({ onBack }) {
  const [savings, setSavings] = useState(null)
  const [f, setF] = useState({ name: '', starting_amount: '' })
  const [error, setError] = useState('')

  const load = () => api('/savings').then(setSavings).catch((e) => setError(e.message))
  useEffect(() => { load() }, [])

  const add = () =>
    api('/savings', [{ ...f, starting_amount: f.starting_amount || '0' }])
      .then(() => { setF({ name: '', starting_amount: '' }); load() })
      .catch((e) => setError(e.message))

  if (!savings) return error ? <p className="banner">{error}</p> : <p className="muted">Loading…</p>

  return (
    <section>
      <h2>Savings</h2>
      {!savings.length && <p className="muted">No savings.</p>}
      {savings.map((s) => (
        <div key={s.id}>
          <div className="row log">
            <span>{s.name}</span>
            <strong className="num sm">{s.total}</strong>
          </div>
          {s.series.length > 1 && (
            <div className="chart">
              <ResponsiveContainer>
                <LineChart data={s.series.map((p) => ({ day: p.day, total: +p.total }))}>
                  <CartesianGrid stroke="#2a2f33" />
                  <XAxis dataKey="day" stroke="#8a9299" />
                  <YAxis stroke="#8a9299" domain={['auto', 'auto']} />
                  <Tooltip contentStyle={{ background: '#181b1e', border: '1px solid #2a2f33' }} />
                  <Line dataKey="total" stroke="#3fb97c" dot />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      ))}
      <h2 className="gap">Add saving</h2>
      <div className="row">
        <input placeholder="Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <input type="number" step="0.01" placeholder="Saved so far" value={f.starting_amount} onChange={(e) => setF({ ...f, starting_amount: e.target.value })} />
      </div>
      {error && <p className="banner">{error}</p>}
      <button disabled={!f.name.trim()} onClick={add}>Add</button>
      <button className="ghost" onClick={onBack}>Back</button>
    </section>
  )
}
