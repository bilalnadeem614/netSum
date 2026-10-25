import { useEffect, useState } from 'react'
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { api } from '../api.js'

const COLORS = ['#3fb97c', '#5b8def', '#e0a43a', '#b07cd8', '#4fb3c4', '#8a9299']
const tip = { contentStyle: { background: '#181b1e', border: '1px solid #2a2f33' } }

export default function Charts({ onBack }) {
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
      <h2>Spend by expense</h2>
      {!data.by_expense.length && <p className="muted">No spending logged yet.</p>}
      {!!data.by_expense.length && (
        <div className="chart">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={num(data.by_expense)} dataKey="total" nameKey="name" label>
                {data.by_expense.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip {...tip} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
      <h2 className="gap">Spend by payment method</h2>
      {!!data.by_method.length && (
        <div className="chart">
          <ResponsiveContainer>
            <BarChart data={num(data.by_method)}>
              <XAxis dataKey="name" stroke="#8a9299" />
              <YAxis stroke="#8a9299" />
              <Tooltip {...tip} />
              <Bar dataKey="total" fill="#3fb97c" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <button className="ghost" onClick={onBack}>Back</button>
    </section>
  )
}
