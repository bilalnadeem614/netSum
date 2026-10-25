import { useEffect, useState } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { api } from '../api.js'

export default function Savings({ onBack }) {
  const [savings, setSavings] = useState(null)
  const [f, setF] = useState({ name: '', starting_amount: '' })
  const [goal, setGoal] = useState(undefined) // undefined = loading, null = none set
  const [g, setG] = useState({ purpose: '', goal_amount: '', daily_threshold: '' })
  const [error, setError] = useState('')

  const load = () => api('/savings').then(setSavings).catch((e) => setError(e.message))
  const loadGoal = () =>
    api('/goal').then((x) => { setGoal(x); if (x) setG(x) }).catch((e) => setError(e.message))
  useEffect(() => { load(); loadGoal() }, [])

  const saveGoal = () =>
    api('/goal', g, 'PUT').then((x) => setGoal(x)).catch((e) => setError(e.message))

  const add = () =>
    api('/savings', [{ ...f, starting_amount: f.starting_amount || '0' }])
      .then(() => { setF({ name: '', starting_amount: '' }); load() })
      .catch((e) => setError(e.message))

  if (!savings) return error ? <p className="banner">{error}</p> : <p className="muted">Loading…</p>

  return (
    <section>
      <h2>Goal</h2>
      {goal && (
        <>
          <p className="muted">{goal.purpose}: {goal.saved} of {goal.goal_amount}</p>
          <div className="bar"><div style={{ width: `${Math.min(100, (goal.saved / goal.goal_amount) * 100)}%` }} /></div>
        </>
      )}
      <div className="row">
        <input placeholder="Purpose" value={g.purpose} onChange={(e) => setG({ ...g, purpose: e.target.value })} />
        <input type="number" step="0.01" placeholder="Goal amount" value={g.goal_amount} onChange={(e) => setG({ ...g, goal_amount: e.target.value })} />
        <input type="number" step="0.01" placeholder="Daily limit" value={g.daily_threshold} onChange={(e) => setG({ ...g, daily_threshold: e.target.value })} />
      </div>
      <button className="ghost" disabled={!g.purpose.trim() || !(+g.goal_amount > 0) || g.daily_threshold === ''} onClick={saveGoal}>
        {goal ? 'Update goal' : 'Set goal'}
      </button>
      <h2 className="gap">Savings</h2>
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
