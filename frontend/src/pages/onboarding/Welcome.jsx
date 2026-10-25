export default function Welcome({ onNext }) {
  return (
    <section>
      <h1>netSum</h1>
      <p className="muted">Track every payment method. A day closes only when your real balances match.</p>
      <button onClick={onNext}>Set up</button>
    </section>
  )
}
