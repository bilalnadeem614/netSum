import { useState } from 'react'
import { api } from '../../api.js'
import MoneyInput, { isMoney } from '../../components/MoneyInput.jsx'

export default function Methods({ onDone }) {
  const [rows, setRows] = useState([
    { name: 'Cash', kind: 'cash', opening_balance: '' },
    { name: 'Account', kind: 'account', opening_balance: '' },
  ])
  const [error, setError] = useState('')

  const set = (i, patch) => setRows(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)))

  async function save() {
    try {
      await api('/methods', rows.map((r) => ({ ...r, opening_balance: r.opening_balance || '0' })))
      onDone()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <section>
      <h1>Payment methods</h1>
      <p className="muted">Enter what each one holds today. Cash and Account are always tracked.</p>
      {rows.map((r, i) => (
        <div className="grid2" key={i}>
          <label className="field">
            <span>{r.kind === 'custom' ? 'Name' : 'Method'}</span>
            {r.kind === 'custom' ? (
              <input value={r.name} placeholder="e.g. Metro card" onChange={(e) => set(i, { name: e.target.value })} />
            ) : (
              <input value={r.name} disabled />
            )}
          </label>
          <label className="field">
            <span>Opening balance</span>
            <MoneyInput value={r.opening_balance} onChange={(v) => set(i, { opening_balance: v })} />
          </label>
        </div>
      ))}
      <button className="secondary" onClick={() => setRows([...rows, { name: '', kind: 'custom', opening_balance: '' }])}>
        + Add method
      </button>
      {error && <p className="banner">{error}</p>}
      <div className="actions">
        <button disabled={rows.some((r) => !r.name.trim() || (r.opening_balance !== '' && !isMoney(r.opening_balance)))} onClick={save}>Continue</button>
      </div>
    </section>
  )
}
