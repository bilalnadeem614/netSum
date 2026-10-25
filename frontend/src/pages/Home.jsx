import { useEffect, useState } from 'react'
import { api } from '../api.js'

export default function Home() {
  const [home, setHome] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api('/home').then(setHome).catch((e) => setError(e.message))
  }, [])

  if (error) return <p className="banner">{error}</p>
  if (!home) return <p className="muted">Loading…</p>

  return (
    <section>
      <p className="muted">{home.day}</p>
      <div className="balances">
        {home.balances.map((b) => (
          <div key={b.id}>
            <span className="muted">{b.name}</span>
            <strong className="num">{b.balance}</strong>
          </div>
        ))}
      </div>
      <p className="muted">No logs yet.</p>
    </section>
  )
}
