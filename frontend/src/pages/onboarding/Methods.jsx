import { useState } from 'react'
import { api } from '../../api.js'

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
            <input
              className="mono" type="number" step="0.01" inputMode="decimal" placeholder="0.00"
              value={r.opening_balance} onChange={(e) => set(i, { opening_balance: e.target.value })}
            />
          </label>
        </div>
      ))}
      <button className="secondary" onClick={() => setRows([...rows, { name: '', kind: 'custom', opening_balance: '' }])}>
        + Add method
      </button>
      {error && <p className="banner">{error}</p>}
      <div className="actions">
        <button disabled={rows.some((r) => !r.name.trim())} onClick={save}>Continue</button>
      </div>
    </section>
  )
}
