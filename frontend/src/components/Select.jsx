import { useEffect, useRef, useState } from 'react'

// Themed replacement for <select>: the native popup can't be styled.
// options: [{ value, label }]; onChange receives the new value.
export default function Select({ value, onChange, options, label }) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const root = useRef(null)
  const selected = options.findIndex((o) => String(o.value) === String(value))

  useEffect(() => {
    if (!open) return
    const away = (e) => { if (!root.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('pointerdown', away)
    return () => document.removeEventListener('pointerdown', away)
  }, [open])

  const show = () => { setActive(Math.max(selected, 0)); setOpen(true) }
  const pick = (i) => { onChange(options[i].value); setOpen(false) }

  function onKey(e) {
    if (e.key === 'Escape' || e.key === 'Tab') return setOpen(false)
    const move = { ArrowDown: 1, ArrowUp: -1 }[e.key]
    if (move) {
      e.preventDefault()
      if (!open) return show()
      setActive((active + move + options.length) % options.length)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      open ? pick(active) : show()
    }
  }

  return (
    <div className="sel" ref={root}>
      <button
        type="button" className="sel-btn" role="combobox" aria-haspopup="listbox" aria-expanded={open} aria-label={label}
        onClick={() => (open ? setOpen(false) : show())} onKeyDown={onKey}
      >
        <span>{options[selected]?.label ?? ''}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
      </button>
      {open && (
        <ul className="sel-menu" role="listbox">
          {options.map((o, i) => (
            <li
              key={o.value} role="option" aria-selected={i === selected}
              className={`${i === selected ? 'on' : ''} ${i === active ? 'act' : ''}`}
              onPointerEnter={() => setActive(i)} onClick={() => pick(i)}
            >
              {o.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
