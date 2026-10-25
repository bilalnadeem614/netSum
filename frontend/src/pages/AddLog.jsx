import { useState } from 'react'
import { api } from '../api.js'

// log = existing log when editing, null when adding
export default function AddLog({ home, log, onSaved, onCancel }) {
  const targets = [
    ...home.expenses.map((x) => ({ key: `expense_id:${x.id}`, label: x.name })),
    ...home.loans.map((x) => ({ key: `loan_id:${x.id}`, label: `Loan: ${x.name}` })),
    ...home.savings.map((x) => ({ key: `saving_id:${x.id}`, label: `Saving: ${x.name}` })),
  ]
  const [f, setF] = useState({
    target: log ? targets.find((t) => t.key.endsWith(`:${log.expense_id ?? log.loan_id ?? log.saving_id}`) && t.key.startsWith(log.kind))?.key : targets[0]?.key,
    amount: log?.amount ?? '',
    method_id: log?.method_id ?? home.balances[0]?.id,
    description: log?.description ?? '',
  })
  const [error, setError] = useState('')
  const set = (patch) => setF({ ...f, ...patch })

  async function save() {
    const [field, id] = f.target.split(':')
    const body = { method_id: +f.method_id, amount: f.amount, description: f.description || null, [field]: +id }
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
        <select value={f.target} onChange={(e) => set({ target: e.target.value })}>
          {targets.map((x) => <option key={x.key} value={x.key}>{x.label}</option>)}
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
      <button disabled={!(+f.amount > 0) || !f.target} onClick={save}>Save</button>
      <button className="ghost" onClick={onCancel}>Cancel</button>
    </section>
  )
}
