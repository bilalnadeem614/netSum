import { useEffect, useState } from 'react'
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { api } from '../api.js'

const COLORS = ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c4)', 'var(--c5)', 'var(--c6)']
const tip = { contentStyle: { background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 5 } }

export default function Charts() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api('/charts/spend').then(setData).catch((e) => setError(e.message))
  }, [])

  if (error) return <p className="banner">{error}</p>
  if (!data) return <p className="muted">Loading…</p>

  const num = (rows) => rows.map((r) => ({ name: r.name, total: +r.total }))

  return (
    <section>
      <h2 className="label">Spend by expense</h2>
      {!data.by_expense.length && <p className="muted">No spending logged yet.</p>}
      {!!data.by_expense.length && (
        <>
          <div className="chart">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={num(data.by_expense)} dataKey="total" nameKey="name" innerRadius={45} outerRadius={80} stroke="var(--bg)">
                  {data.by_expense.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip {...tip} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="rows">
            {data.by_expense.map((r, i) => (
              <div className="line" key={r.name}>
                <span><span style={{ color: COLORS[i % COLORS.length] }}>●</span> {r.name}</span>
                <span className="amt">{r.total}</span>
              </div>
            ))}
          </div>
        </>
      )}
      <h2 className="label">Spend by payment method</h2>
      {!!data.by_method.length && (
        <div className="chart">
          <ResponsiveContainer>
            <BarChart data={num(data.by_method)}>
              <XAxis dataKey="name" stroke="var(--muted)" tickLine={false} axisLine={{ stroke: 'var(--line)' }} />
              <YAxis stroke="var(--muted)" tickLine={false} axisLine={false} />
              <Tooltip {...tip} cursor={{ fill: 'var(--chip)' }} />
              <Bar dataKey="total" fill="var(--c1)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  )
}
