import { useEffect, useState } from 'react'
import { api } from '../api.js'
import AddLog from './AddLog.jsx'
import CloseDay from './CloseDay.jsx'
import History from './History.jsx'
import Loans from './Loans.jsx'
import Savings from './Savings.jsx'

export default function Home() {
  const [home, setHome] = useState(null)
  const [error, setError] = useState('')
  const [form, setForm] = useState(null) // null = hidden, {} = add, log = edit
  const [view, setView] = useState('home')

  const load = () => api('/home').then(setHome).catch((e) => setError(e.message))
  useEffect(() => { load() }, [])

  const saved = () => { setForm(null); load() }
  const remove = (id) => api(`/logs/${id}`, null, 'DELETE').then(load).catch((e) => setError(e.message))

  if (error) return <p className="banner">{error}</p>
  if (!home) return <p className="muted">Loading…</p>
  const back = () => { setView('home'); load() }
  if (view === 'history') return <History onBack={back} />
  if (view === 'loans') return <Loans onBack={back} />
  if (view === 'savings') return <Savings onBack={back} />
  if (view === 'close') return <CloseDay onBack={back} onClosed={back} />

  const method = (id) => home.balances.find((b) => b.id === id)?.name

  return (
    <section>
      <p className="muted">
        {home.day < new Date().toLocaleDateString('en-CA') ? `Catching up: ${home.day}` : home.day}
      </p>
      <div className="balances">
        {home.balances.map((b) => (
          <div key={b.id}>
            <span className="muted">{b.name}</span>
            <strong className="num">{b.balance}</strong>
          </div>
        ))}
      </div>
      {form ? (
        <AddLog home={home} log={form.id ? form : null} onSaved={saved} onCancel={() => setForm(null)} />
      ) : (
        <>
          <button onClick={() => setForm({})}>Add log</button>
          <button className="ghost" onClick={() => setView('close')}>Close day</button>
          <button className="ghost" onClick={() => setView('history')}>History</button>
          <button className="ghost" onClick={() => setView('loans')}>Loans</button>
          <button className="ghost" onClick={() => setView('savings')}>Savings</button>
        </>
      )}
      <h2 className="gap">Today</h2>
      {!home.logs.length && <p className="muted">No logs yet.</p>}
      {home.logs.map((l) => (
        <div className="row log" key={l.id}>
          <span>
            {l.expense}
            <small className="muted"> · {method(l.method_id)}{l.description && ` · ${l.description}`}</small>
          </span>
          <strong className="num sm">-{l.amount}</strong>
          <button className="ghost" onClick={() => setForm(l)}>Edit</button>
          <button className="ghost" onClick={() => remove(l.id)}>Delete</button>
        </div>
      ))}
    </section>
  )
}
