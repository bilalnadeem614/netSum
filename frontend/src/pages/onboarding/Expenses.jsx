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
      <h2>Expenses</h2>
      <p className="muted">Predefined spends you can pick when logging (lunch, bus, internet bill…).</p>
      {rows.map((r, i) => (
        <div className="row" key={i}>
          <input placeholder="Name" value={r.name} onChange={(e) => set(i, { name: e.target.value })} />
          <select value={r.kind} onChange={(e) => set(i, { kind: e.target.value })}>
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
          </select>
          <label className="muted">
            <input type="checkbox" checked={r.essential} onChange={(e) => set(i, { essential: e.target.checked })} /> Essential
          </label>
        </div>
      ))}
      <button className="ghost" onClick={() => setRows([...rows, { ...blank }])}>+ Add expense</button>
      {error && <p className="banner">{error}</p>}
      <button disabled={!valid.length} onClick={save}>Continue</button>
    </section>
  )
}
