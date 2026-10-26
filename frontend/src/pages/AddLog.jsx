import { useState } from 'react'
import { api } from '../api.js'
import Select from '../components/Select.jsx'
import MoneyInput, { isMoney } from '../components/MoneyInput.jsx'

const KINDS = [['spend', 'Spend'], ['income', 'Income'], ['transfer', 'Transfer']]

// log = existing log when editing, null when adding
export default function AddLog({ home, log, onSaved, onCancel }) {
  const targets = [
    ...home.expenses.map((x) => ({ key: `expense_id:${x.id}`, label: x.name })),
    ...home.loans.map((x) => ({ key: `loan_id:${x.id}`, label: `Loan: ${x.name}` })),
    ...home.savings.map((x) => ({ key: `saving_id:${x.id}`, label: `Saving: ${x.name}` })),
  ]
  const ms = home.balances
  const incomeMs = ms.filter((m) => m.kind !== 'custom') // income goes to Cash or Account only
  const [kind, setKind] = useState(log?.type ?? 'spend')
  const [f, setF] = useState({
    target: log?.target
      ? targets.find((t) => t.key === `${log.target}_id:${log[`${log.target}_id`]}`)?.key
      : targets[0]?.key,
    amount: log?.amount ?? '',
    method_id: log?.method_id ?? ms[0]?.id,
    to_method_id: log?.to_method_id ?? ms[1]?.id ?? ms[0]?.id,
    // income keeps its source in the title (`expense`); spend and transfer keep a note
    description: (log?.type === 'income' ? log.expense : log?.description) ?? '',
  })
  const [error, setError] = useState('')
  const set = (patch) => setF({ ...f, ...patch })

  async function save() {
    const body = { kind, method_id: +f.method_id, amount: f.amount, description: f.description.trim() || null }
    if (kind === 'spend') {
      const [field, id] = f.target.split(':')
      body[field] = +id
    }
    if (kind === 'transfer') body.to_method_id = +f.to_method_id
    try {
      await (log ? api(`/logs/${log.id}`, body, 'PUT') : api('/logs', body))
      onSaved()
    } catch (e) {
      setError(e.message)
    }
  }

  const methodSelect = (label, key, list = ms) => (
    <div className="field"><span>{label}</span>
      <Select label={label} value={f[key]} onChange={(v) => set({ [key]: v })} options={list.map((x) => ({ value: x.id, label: x.name }))} />
    </div>
  )
  const amount = (
    <label className="field"><span>Amount</span>
      <MoneyInput value={f.amount} onChange={(amount) => set({ amount })} />
    </label>
  )
  const note = (label) => (
    <label className="field"><span>{label}</span>
      <input value={f.description} onChange={(e) => set({ description: e.target.value })} />
    </label>
  )

  const ready = isMoney(f.amount) && +f.amount > 0 && (
    kind === 'spend' ? !!f.target
    : kind === 'income' ? !!f.description.trim()
    : +f.method_id !== +f.to_method_id
  )

  return (
    <div className="sheet">
      <h2>{log ? `Edit ${kind}` : 'Add log'}</h2>
      {!log && <div className="seg" role="tablist">
        {KINDS.map(([k, label]) => (
          <button key={k} role="tab" aria-selected={kind === k} className={kind === k ? 'on' : ''} onClick={() => { setKind(k); setError(''); if (k === 'income' && !incomeMs.some((m) => m.id === +f.method_id)) set({ method_id: incomeMs[0]?.id }) }}>
            {label}
          </button>
        ))}
      </div>}

      {kind === 'spend' && (
        <>
          <div className="field"><span>What for</span>
            <Select label="What for" value={f.target} onChange={(target) => set({ target })} options={targets.map((x) => ({ value: x.key, label: x.label }))} />
          </div>
          <div className="grid2">{methodSelect('Paid from', 'method_id')}{amount}</div>
          {note('Note (optional)')}
        </>
      )}
      {kind === 'income' && (
        <>
          {note('Source (e.g. Salary)')}
          <div className="grid2">{methodSelect('Received in', 'method_id', incomeMs)}{amount}</div>
        </>
      )}
      {kind === 'transfer' && (
        <>
          <div className="grid2">{methodSelect('From', 'method_id')}{methodSelect('To', 'to_method_id')}</div>
          {amount}
          {note('Note (optional)')}
        </>
      )}

      {error && <p className="banner">{error}</p>}
      <div className="actions">
        <button disabled={!ready} onClick={save}>Save</button>
        <button className="secondary" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}
