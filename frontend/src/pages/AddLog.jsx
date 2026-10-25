import { useState } from 'react'
import { api } from '../api.js'

// log = existing log when editing, null when adding
export default function AddLog({ home, log, onSaved, onCancel }) {
  const [f, setF] = useState({
    expense_id: log?.expense_id ?? home.expenses[0]?.id,
    amount: log?.amount ?? '',
    method_id: log?.method_id ?? home.balances[0]?.id,
    description: log?.description ?? '',
  })
  const [error, setError] = useState('')
  const set = (patch) => setF({ ...f, ...patch })

  async function save() {
    const body = { ...f, expense_id: +f.expense_id, method_id: +f.method_id, description: f.description || null }
    try {
      await (log ? api(`/logs/${log.id}`, body, 'PUT') : api('/logs', body))
      onSaved()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <section className="panel">
      <h2>{log ? 'Edit log' : 'Add log'}</h2>
      <div className="row">
        <select value={f.expense_id} onChange={(e) => set({ expense_id: e.target.value })}>
          {home.expenses.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
        </select>
        <select value={f.method_id} onChange={(e) => set({ method_id: e.target.value })}>
          {home.balances.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
        </select>
      </div>
      <div className="row">
        <input type="number" step="0.01" inputMode="decimal" placeholder="Amount" value={f.amount} onChange={(e) => set({ amount: e.target.value })} />
        <input placeholder="Note (optional)" value={f.description} onChange={(e) => set({ description: e.target.value })} />
      </div>
      {error && <p className="banner">{error}</p>}
      <button disabled={!(+f.amount > 0)} onClick={save}>Save</button>
      <button className="ghost" onClick={onCancel}>Cancel</button>
    </section>
  )
}
