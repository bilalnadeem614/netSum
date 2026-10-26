export default function Welcome({ onNext }) {
  return (
    <section>
      <h1>Your money, counted every day.</h1>
      <p className="muted">
        Track each payment method on its own. A day closes only when the balances you count
        match the balances netSum calculates.
      </p>
      <div className="actions"><button onClick={onNext}>Set up</button></div>
    </section>
  )
}
