// Money field: up to 2 decimal places (matches the backend and numeric(12,2)).
export const isMoney = (v) => /^-?\d+(\.\d{1,2})?$/.test(String(v).trim())

// onChange receives the new string value. Red border while more than 2 decimals are typed.
export default function MoneyInput({ value, onChange, placeholder = '0.00', ...rest }) {
  const bad = value !== '' && !isMoney(value)
  return (
    <input
      className={`mono ${bad ? 'invalid' : ''}`} type="number" step="0.01" inputMode="decimal"
      placeholder={placeholder} value={value} aria-invalid={bad} title={bad ? 'Up to 2 decimal places' : undefined}
      onChange={(e) => onChange(e.target.value)} {...rest}
    />
  )
}
