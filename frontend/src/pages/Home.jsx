import { useEffect, useState } from 'react'
import { api } from '../api.js'
import AddLog from './AddLog.jsx'
import CloseDay from './CloseDay.jsx'
import History from './History.jsx'
import Loans from './Loans.jsx'
import Savings from './Savings.jsx'
import Charts from './Charts.jsx'

const TABS = [['home', 'Home'], ['history', 'History'], ['charts', 'Charts'], ['savings', 'Savings'], ['loans', 'Loans']]
const PAGES = { history: History, charts: Charts, savings: Savings, loans: Loans }

// display-only sum in integer cents; real money maths stays on the backend
const total = (balances) => (balances.reduce((s, b) => s + Math.round(+b.balance * 100), 0) / 100).toFixed(2)

export default function Home() {
  const [home, setHome] = useState(null)
  const [error, setError] = useState('')
  const [form, setForm] = useState(null) // null = hidden, {} = add, log = edit
  const [view, setView] = useState('home') // a tab name, or 'close'

  const load = () => api('/home').then(setHome).catch((e) => setError(e.message))
  useEffect(() => { load() }, [])

  const go = (v) => { setView(v); if (v === 'home') load() }
  const saved = () => { setForm(null); load() }
  const remove = (id) => api(`/logs/${id}`, null, 'DELETE').then(load).catch((e) => setError(e.message))

  const Page = PAGES[view]
  let body
  if (Page) body = <Page />
  else if (error) body = <p className="banner">{error}</p>
  else if (!home) body = <p className="muted">Loading…</p>
  else if (view === 'close') body = <CloseDay onBack={() => go('home')} onClosed={() => go('home')} />
  else body = <Today home={home} form={form} setForm={setForm} saved={saved} remove={remove} onClose={() => setView('close')} />

  return (
    <>
      <main>{body}</main>
      <nav className="tabbar">
        <div>
          {TABS.map(([id, label]) => (
            <button key={id} className={`tab ${(view === id || (id === 'home' && view === 'close')) ? 'on' : ''}`} onClick={() => go(id)}>
              {label}
            </button>
          ))}
        </div>
      </nav>
    </>
  )
}

function Today({ home, form, setForm, saved, remove, onClose }) {
  const method = (id) => home.balances.find((b) => b.id === id)?.name
  const catchingUp = home.day < new Date().toLocaleDateString('en-CA')
  const over = home.goal && +home.non_essential_spent > +home.goal.daily_threshold

  return (
    <section>
      <div className="meta">
        <span className="mono">{home.day}</span>
        <span className={`chip ${catchingUp ? 'warn' : ''}`}>{catchingUp ? 'Catching up' : 'Open'}</span>
      </div>

      <div className="hero">
        <span className="label" style={{ margin: 0 }}>Total balance</span>
        <span className="amt">{total(home.balances)}</span>
      </div>

      <div className="rows">
        {home.balances.map((b) => (
          <div className="line" key={b.id}>
            <span>{b.name}</span>
            <span className="amt">{b.balance}</span>
          </div>
        ))}
      </div>

      {home.goal && (
        <p className={over ? 'red' : 'muted'} style={{ marginTop: 12 }}>
          Non-essential today <span className="mono">{home.non_essential_spent} / {home.goal.daily_threshold}</span>
          {over && ' · over your limit'}
        </p>
      )}

      {form ? (
        <AddLog home={home} log={form.id ? form : null} onSaved={saved} onCancel={() => setForm(null)} />
      ) : (
        <div className="actions">
          <button onClick={() => setForm({})}>Add log</button>
          <button className="secondary" onClick={onClose}>Close day</button>
        </div>
      )}

      <h2 className="label">Today</h2>
      {!home.logs.length && <p className="muted">Nothing logged yet.</p>}
      <div className="rows">
        {home.logs.map((l) => (
          <div className="line" key={l.id}>
            <div className="grow">
              {l.expense}
              <small>{method(l.method_id)}{l.description && ` · ${l.description}`}</small>
              <div className="sm-actions">
                <button className="link" onClick={() => setForm(l)}>Edit</button>
                <button className="link danger" onClick={() => remove(l.id)}>Delete</button>
              </div>
            </div>
            <span className="amt">−{l.amount}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
