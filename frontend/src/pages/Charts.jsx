import { useEffect, useState } from 'react'
import { Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { api } from '../api.js'
import Loading from '../components/Loading.jsx'

const COLORS = ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c4)', 'var(--c5)', 'var(--c6)']
const tip = { contentStyle: { background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 5 } }
const money = (v) => Number(v).toFixed(2)
const num = (rows) => rows.map((r) => ({ name: r.name, total: +r.total }))

function Donut({ rows }) {
  return (
    <>
      <div className="chart">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={num(rows)} dataKey="total" nameKey="name" innerRadius={45} outerRadius={80} stroke="var(--bg)">
              {rows.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip {...tip} formatter={money} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="rows">
        {rows.map((r, i) => (
          <div className="line" key={r.name}>
            <span><span style={{ color: COLORS[i % COLORS.length] }}>●</span> {r.name}</span>
            <span className="amt">{r.total}</span>
          </div>
        ))}
      </div>
    </>
  )
}

export default function Charts() {
  const [data, setData] = useState(null)
  const [flow, setFlow] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api('/charts/spend'), api('/charts/cashflow')])
      .then(([d, f]) => { setData(d); setFlow(f) })
      .catch((e) => setError(e.message))
  }, [])

  if (error) return <p className="banner">{error}</p>
  if (!data || !flow) return <Loading kind="chart" />

  const months = flow.months.map((m) => ({ month: m.month, Income: +m.income, Spend: +m.spend }))

  return (
    <section>
      <h2 className="label">Overview</h2>
      <div className="rows">
        <div className="line"><span>Income</span><span className="amt green">+{flow.income_total}</span></div>
        <div className="line"><span>Spend</span><span className="amt">−{flow.spend_total}</span></div>
        <div className="line"><span>Net</span><span className={`amt ${+flow.net < 0 ? 'red' : ''}`}>{flow.net}</span></div>
      </div>

      <h2 className="label">Income vs spend by month</h2>
      {!months.length && <p className="muted">Nothing logged yet.</p>}
      {!!months.length && (
        <div className="chart">
          <ResponsiveContainer>
            <BarChart data={months}>
              <XAxis dataKey="month" stroke="var(--muted)" tickLine={false} axisLine={{ stroke: 'var(--line)' }} />
              <YAxis stroke="var(--muted)" tickLine={false} axisLine={false} />
              <Tooltip {...tip} formatter={money} cursor={{ fill: 'var(--chip)' }} />
              <Legend wrapperStyle={{ color: 'var(--muted)' }} />
              <Bar dataKey="Income" fill="var(--c1)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Spend" fill="var(--c3)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <h2 className="label">Spend by expense</h2>
      {!data.by_expense.length && <p className="muted">No spending logged yet.</p>}
      {!!data.by_expense.length && <Donut rows={data.by_expense} />}

      <h2 className="label">Spend by payment method</h2>
      {!!data.by_method.length && (
        <div className="chart">
          <ResponsiveContainer>
            <BarChart data={num(data.by_method)}>
              <XAxis dataKey="name" stroke="var(--muted)" tickLine={false} axisLine={{ stroke: 'var(--line)' }} />
              <YAxis stroke="var(--muted)" tickLine={false} axisLine={false} />
              <Tooltip {...tip} formatter={money} cursor={{ fill: 'var(--chip)' }} />
              <Bar dataKey="total" fill="var(--c1)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <h2 className="label">Income by source</h2>
      {!flow.by_source.length && <p className="muted">No income logged yet.</p>}
      {!!flow.by_source.length && <Donut rows={flow.by_source} />}
    </section>
  )
}
