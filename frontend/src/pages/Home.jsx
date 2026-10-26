import { useEffect, useState } from 'react'
import { api } from '../api.js'
import Loading from '../components/Loading.jsx'
import AddLog from './AddLog.jsx'
import CloseDay from './CloseDay.jsx'
import History from './History.jsx'
import Loans from './Loans.jsx'
import Savings from './Savings.jsx'
import Charts from './Charts.jsx'

const svg = (d) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
)
const TABS = [
  ['home', 'Home', svg(<><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></>)],
  ['history', 'History', svg(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>)],
  ['charts', 'Charts', svg(<path d="M5 20v-7M12 20V5M19 20V9" />)],
  ['savings', 'Savings', svg(<><path d="M3 17l6-6 4 4 8-8" /><path d="M15 7h6v6" /></>)],
  ['loans', 'Loans', svg(<><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="3" /></>)],
]
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
  else if (!home) body = <Loading kind="home" />
  else if (view === 'close') body = <CloseDay onBack={() => go('home')} onClosed={() => go('home')} />
  else body = <Today home={home} form={form} setForm={setForm} saved={saved} remove={remove} onClose={() => setView('close')} />

  return (
    <>
      <main>{body}</main>
      <nav className="tabbar">
        <div>
          {TABS.map(([id, label, icon]) => (
            <button key={id} className={`tab ${(view === id || (id === 'home' && view === 'close')) ? 'on' : ''}`} onClick={() => go(id)}>
              {icon}
              {label}
            </button>
          ))}
        </div>
      </nav>
    </>
  )
}

const Pencil = svg(<><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></>)
const Bin = svg(<><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /></>)

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
            </div>
            <div className="end">
              <span className="amt">−{l.amount}</span>
              <div className="icons">
                <button className="icon" aria-label={`Edit ${l.expense}`} onClick={() => setForm(l)}>{Pencil}</button>
                <button className="icon danger" aria-label={`Delete ${l.expense}`} onClick={() => remove(l.id)}>{Bin}</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
