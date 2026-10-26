import { useState } from 'react'
import { api } from '../../api.js'

export default function LoansSavings({ onDone }) {
  const [loans, setLoans] = useState([])
  const [savings, setSavings] = useState([])
  const [error, setError] = useState('')

  const edit = (list, setList, i, patch) => setList(list.map((r, j) => (j === i ? { ...r, ...patch } : r)))

  async function save() {
    try {
      const l = loans.filter((r) => r.name.trim() && +r.total > 0)
      const s = savings.filter((r) => r.name.trim())
      if (l.length) await api('/loans', l)
      if (s.length) await api('/savings', s)
      onDone()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <section>
      <h1>Loans and savings</h1>
      <p className="muted">Optional. You can add these later from their tabs.</p>
      <h2 className="label">Loans</h2>
      {loans.map((r, i) => (
        <div className="grid2" key={i}>
          <label className="field"><span>Name</span>
            <input value={r.name} onChange={(e) => edit(loans, setLoans, i, { name: e.target.value })} /></label>
          <label className="field"><span>Amount owed</span>
            <input className="mono" type="number" step="0.01" inputMode="decimal" value={r.total} onChange={(e) => edit(loans, setLoans, i, { total: e.target.value })} /></label>
        </div>
      ))}
      <button className="secondary" onClick={() => setLoans([...loans, { name: '', total: '' }])}>+ Add loan</button>
      <h2 className="label">Savings</h2>
      {savings.map((r, i) => (
        <div className="grid2" key={i}>
          <label className="field"><span>Name</span>
            <input value={r.name} placeholder="e.g. Bank" onChange={(e) => edit(savings, setSavings, i, { name: e.target.value })} /></label>
          <label className="field"><span>Saved so far</span>
            <input className="mono" type="number" step="0.01" inputMode="decimal" value={r.starting_amount} onChange={(e) => edit(savings, setSavings, i, { starting_amount: e.target.value })} /></label>
        </div>
      ))}
      <button className="secondary" onClick={() => setSavings([...savings, { name: '', starting_amount: '' }])}>+ Add saving</button>
      {error && <p className="banner">{error}</p>}
      <div className="actions"><button onClick={save}>{loans.length || savings.length ? 'Finish' : 'Skip'}</button></div>
    </section>
  )
}
