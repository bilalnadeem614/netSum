import { useEffect, useRef } from 'react'

// Centered dialog (bottom sheet on phones). Closes on Escape or a backdrop click.
export default function Modal({ title, onClose, children }) {
  const panel = useRef(null)
  const close = useRef(onClose)
  close.current = onClose // latest handler without re-running the effect below

  useEffect(() => {
    const key = (e) => e.key === 'Escape' && close.current()
    const prevFocus = document.activeElement
    document.addEventListener('keydown', key)
    document.body.style.overflow = 'hidden'
    panel.current?.querySelector('input, button')?.focus()
    return () => {
      document.removeEventListener('keydown', key)
      document.body.style.overflow = ''
      prevFocus?.focus?.()
    }
  }, [])

  return (
    <div className="modal" onPointerDown={(e) => e.target === e.currentTarget && close.current()}>
      <div className="modal-panel" role="dialog" aria-modal="true" aria-label={title} ref={panel}>
        {children}
      </div>
    </div>
  )
}
