import { useEffect, useState } from 'react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { api } from '../api.js'

export default function Loans() {
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
      <h2 className="label">Loans</h2>
      {!loans.length && <p className="muted">No loans yet.</p>}
      <div className="rows">
        {loans.map((l) => (
          <div className="line" key={l.id}>
            <div className="grow">{l.name}<small>owed {l.total} · paid {l.paid}</small></div>
            <span className="amt">{l.remaining}</span>
          </div>
        ))}
      </div>
      {!!loans.length && (
        <div className="chart" style={{ marginTop: 16 }}>
          <ResponsiveContainer>
            <BarChart data={data} layout="vertical">
              <XAxis type="number" stroke="var(--muted)" tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" stroke="var(--muted)" width={70} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)' }} cursor={{ fill: 'var(--chip)' }} />
              <Bar dataKey="paid" stackId="a" fill="var(--c1)" />
              <Bar dataKey="remaining" stackId="a" fill="var(--line)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <h2 className="label">Add loan</h2>
      <div className="grid2">
        <label className="field"><span>Name</span>
          <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
        <label className="field"><span>Amount owed</span>
          <input className="mono" type="number" step="0.01" inputMode="decimal" value={f.total} onChange={(e) => setF({ ...f, total: e.target.value })} /></label>
      </div>
      {error && <p className="banner">{error}</p>}
      <div className="actions"><button disabled={!f.name.trim() || !(+f.total > 0)} onClick={add}>Add loan</button></div>
    </section>
  )
}
