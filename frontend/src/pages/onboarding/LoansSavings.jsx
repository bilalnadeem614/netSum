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
      <h2>Loans</h2>
      {loans.map((r, i) => (
        <div className="row" key={i}>
          <input placeholder="Name" value={r.name} onChange={(e) => edit(loans, setLoans, i, { name: e.target.value })} />
          <input type="number" step="0.01" placeholder="Amount owed" value={r.total} onChange={(e) => edit(loans, setLoans, i, { total: e.target.value })} />
        </div>
      ))}
      <button className="ghost" onClick={() => setLoans([...loans, { name: '', total: '' }])}>+ Add loan</button>
      <h2 className="gap">Savings</h2>
      {savings.map((r, i) => (
        <div className="row" key={i}>
          <input placeholder="Name (e.g. Bank)" value={r.name} onChange={(e) => edit(savings, setSavings, i, { name: e.target.value })} />
          <input type="number" step="0.01" placeholder="Saved so far" value={r.starting_amount} onChange={(e) => edit(savings, setSavings, i, { starting_amount: e.target.value })} />
        </div>
      ))}
      <button className="ghost" onClick={() => setSavings([...savings, { name: '', starting_amount: '' }])}>+ Add saving</button>
      {error && <p className="banner">{error}</p>}
      <div><button onClick={save}>{loans.length || savings.length ? 'Finish' : 'Skip'}</button></div>
    </section>
  )
}
