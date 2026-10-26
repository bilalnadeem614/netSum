import { useEffect, useState } from 'react'
import { api } from './api.js'
import Welcome from './pages/onboarding/Welcome.jsx'
import Methods from './pages/onboarding/Methods.jsx'
import Expenses from './pages/onboarding/Expenses.jsx'
import LoansSavings from './pages/onboarding/LoansSavings.jsx'
import Home from './pages/Home.jsx'
import Loading from './components/Loading.jsx'

const Sun = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
)
const Moon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
)

function ThemeToggle() {
  const [theme, setTheme] = useState(document.documentElement.dataset.theme)
  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    document.querySelector('meta[name=theme-color]')?.setAttribute('content', next === 'dark' ? '#0f1113' : '#f5f4ef')
    try { localStorage.setItem('theme', next) } catch {}
    setTheme(next)
  }
  return (
    <button className="theme" onClick={toggle} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>
      {theme === 'dark' ? Sun : Moon}
    </button>
  )
}

export default function App() {
  const [screen, setScreen] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    api('/state')
      .then((s) => setScreen(!s.has_methods ? 'welcome' : !s.has_expenses ? 'expenses' : 'home'))
      .catch((e) => setError(e.message))
  }, [])

  return (
    <div className="app">
      <header className="topbar">
        <span className="brand">net<b>Sum</b></span>
        <ThemeToggle />
      </header>
      {screen === 'home' ? (
        <Home />
      ) : (
        <main>
          {error && <p className="banner">{error}</p>}
          {screen === 'loading' && !error && <Loading kind="home" />}
          {screen === 'welcome' && <Welcome onNext={() => setScreen('methods')} />}
          {screen === 'methods' && <Methods onDone={() => setScreen('expenses')} />}
          {screen === 'expenses' && <Expenses onDone={() => setScreen('loanssavings')} />}
          {screen === 'loanssavings' && <LoansSavings onDone={() => setScreen('home')} />}
        </main>
      )}
    </div>
  )
}
