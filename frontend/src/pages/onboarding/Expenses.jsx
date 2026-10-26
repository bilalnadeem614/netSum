import { useState } from 'react'
import { api } from '../../api.js'

const blank = { name: '', kind: 'daily', essential: true }

export default function Expenses({ onDone }) {
  const [rows, setRows] = useState([{ ...blank }])
  const [error, setError] = useState('')

  const set = (i, patch) => setRows(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)))
  const valid = rows.filter((r) => r.name.trim())

  async function save() {
    try {
      await api('/expenses', valid)
      onDone()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <section>
      <h1>Expenses</h1>
      <p className="muted">The spends you pick from when logging: lunch, bus, the internet bill.</p>
      {rows.map((r, i) => (
        <div className="line" style={{ display: 'block' }} key={i}>
          <label className="field">
            <span>Name</span>
            <input value={r.name} placeholder="e.g. Lunch" onChange={(e) => set(i, { name: e.target.value })} />
          </label>
          <div className="grid2">
            <label className="field">
              <span>Type</span>
              <select value={r.kind} onChange={(e) => set(i, { kind: e.target.value })}>
                <option value="daily">Daily</option>
                <option value="monthly">Monthly</option>
              </select>
            </label>
            <label className="check">
              <input type="checkbox" checked={r.essential} onChange={(e) => set(i, { essential: e.target.checked })} />
              Essential
            </label>
          </div>
        </div>
      ))}
      <div className="actions"><button className="secondary" onClick={() => setRows([...rows, { ...blank }])}>+ Add expense</button></div>
      {error && <p className="banner">{error}</p>}
      <div className="actions"><button disabled={!valid.length} onClick={save}>Continue</button></div>
    </section>
  )
}
