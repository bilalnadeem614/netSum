import { useEffect, useState } from 'react'
import { api } from './api.js'
import Welcome from './pages/onboarding/Welcome.jsx'
import Methods from './pages/onboarding/Methods.jsx'
import Expenses from './pages/onboarding/Expenses.jsx'
import LoansSavings from './pages/onboarding/LoansSavings.jsx'
import Home from './pages/Home.jsx'

export default function App() {
  const [screen, setScreen] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    api('/state')
      .then((s) => setScreen(!s.has_methods ? 'welcome' : !s.has_expenses ? 'expenses' : 'home'))
      .catch((e) => setError(e.message))
  }, [])

  return (
    <main>
      {error && <p className="banner">{error}</p>}
      {screen === 'loading' && !error && <p className="muted">Loading…</p>}
      {screen === 'welcome' && <Welcome onNext={() => setScreen('methods')} />}
      {screen === 'methods' && <Methods onDone={() => setScreen('expenses')} />}
      {screen === 'expenses' && <Expenses onDone={() => setScreen('loanssavings')} />}
      {screen === 'loanssavings' && <LoansSavings onDone={() => setScreen('home')} />}
      {screen === 'home' && <Home />}
    </main>
  )
}
