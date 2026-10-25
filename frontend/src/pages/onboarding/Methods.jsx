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
      <h2>Payment methods</h2>
      {rows.map((r, i) => (
        <div className="row" key={i}>
          {r.kind === 'custom' ? (
            <input placeholder="Name" value={r.name} onChange={(e) => set(i, { name: e.target.value })} />
          ) : (
            <span>{r.name}</span>
          )}
          <input
            type="number" step="0.01" inputMode="decimal" placeholder="Opening balance"
            value={r.opening_balance} onChange={(e) => set(i, { opening_balance: e.target.value })}
          />
        </div>
      ))}
      <button className="ghost" onClick={() => setRows([...rows, { name: '', kind: 'custom', opening_balance: '' }])}>
        + Add method
      </button>
      {error && <p className="banner">{error}</p>}
      <button disabled={rows.some((r) => !r.name.trim())} onClick={save}>Continue</button>
    </section>
  )
}
