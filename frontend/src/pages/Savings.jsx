import { useEffect, useState } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { api } from '../api.js'

export default function Savings() {
  const [savings, setSavings] = useState(null)
  const [f, setF] = useState({ name: '', starting_amount: '' })
  const [goal, setGoal] = useState(undefined) // undefined = loading, null = none set
  const [g, setG] = useState({ purpose: '', goal_amount: '', daily_threshold: '' })
  const [error, setError] = useState('')

  const load = () => api('/savings').then(setSavings).catch((e) => setError(e.message))
  const loadGoal = () =>
    api('/goal').then((x) => { setGoal(x); if (x) setG(x) }).catch((e) => setError(e.message))
  useEffect(() => { load(); loadGoal() }, [])

  const saveGoal = () => api('/goal', g, 'PUT').then(setGoal).catch((e) => setError(e.message))
  const add = () =>
    api('/savings', [{ ...f, starting_amount: f.starting_amount || '0' }])
      .then(() => { setF({ name: '', starting_amount: '' }); load() })
      .catch((e) => setError(e.message))

  if (!savings) return error ? <p className="banner">{error}</p> : <p className="muted">Loading…</p>

  const pct = goal ? Math.min(100, (goal.saved / goal.goal_amount) * 100) : 0

  return (
    <section>
      <h2 className="label">Goal</h2>
      {goal && (
        <>
          <div className="line" style={{ borderBottom: 0, paddingBottom: 0 }}>
            <span>{goal.purpose}</span>
            <span className="amt">{goal.saved} <span className="muted">/ {goal.goal_amount}</span></span>
          </div>
          <div className="bar"><div style={{ width: `${pct}%` }} /></div>
        </>
      )}
      <div className="grid2">
        <label className="field"><span>Purpose</span>
          <input value={g.purpose} onChange={(e) => setG({ ...g, purpose: e.target.value })} /></label>
        <label className="field"><span>Goal amount</span>
          <input className="mono" type="number" step="0.01" inputMode="decimal" value={g.goal_amount} onChange={(e) => setG({ ...g, goal_amount: e.target.value })} /></label>
      </div>
      <label className="field"><span>Daily limit for non-essential spending</span>
        <input className="mono" type="number" step="0.01" inputMode="decimal" value={g.daily_threshold} onChange={(e) => setG({ ...g, daily_threshold: e.target.value })} /></label>
      <button className="secondary" disabled={!g.purpose.trim() || !(+g.goal_amount > 0) || g.daily_threshold === ''} onClick={saveGoal}>
        {goal ? 'Update goal' : 'Set goal'}
      </button>

      <h2 className="label">Savings</h2>
      {!savings.length && <p className="muted">No savings yet.</p>}
      {savings.map((s) => (
        <div key={s.id}>
          <div className="line"><span>{s.name}</span><span className="amt">{s.total}</span></div>
          {s.series.length > 1 && (
            <div className="chart">
              <ResponsiveContainer>
                <LineChart data={s.series.map((p) => ({ day: p.day, total: +p.total }))}>
                  <CartesianGrid stroke="var(--line)" vertical={false} />
                  <XAxis dataKey="day" stroke="var(--muted)" tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted)" domain={['auto', 'auto']} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)' }} />
                  <Line dataKey="total" stroke="var(--c1)" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      ))}

      <h2 className="label">Add saving</h2>
      <div className="grid2">
        <label className="field"><span>Name</span>
          <input value={f.name} placeholder="e.g. Bank" onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
        <label className="field"><span>Saved so far</span>
          <input className="mono" type="number" step="0.01" inputMode="decimal" value={f.starting_amount} onChange={(e) => setF({ ...f, starting_amount: e.target.value })} /></label>
      </div>
      {error && <p className="banner">{error}</p>}
      <div className="actions"><button disabled={!f.name.trim()} onClick={add}>Add saving</button></div>
    </section>
  )
}
