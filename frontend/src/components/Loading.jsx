import { useEffect, useState } from 'react'

const Bar = ({ w = '100%', h = 14, mt = 0 }) => <div className="sk" style={{ width: w, height: h, marginTop: mt }} />
const Row = () => (
  <div className="line">
    <div style={{ flex: 1 }}><Bar w="45%" /><Bar w="25%" h={10} mt={8} /></div>
    <Bar w={70} />
  </div>
)

// kind: 'home' (balances + ledger), 'list' (rows), 'chart' (block + rows)
export default function Loading({ kind = 'list' }) {
  const [slow, setSlow] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setSlow(true), 5000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div role="status" aria-label="Loading">
      {kind === 'home' && (
        <>
          <Bar w={130} h={12} />
          <Bar w="55%" h={38} mt={14} />
          <div className="rows" style={{ marginTop: 22 }}><Row /><Row /><Row /></div>
          <div className="actions"><Bar h={44} /><Bar h={44} /></div>
          <div className="rows" style={{ marginTop: 28 }}><Row /><Row /></div>
        </>
      )}
      {kind === 'chart' && (
        <>
          <Bar w={140} h={12} />
          <Bar h={190} mt={14} />
          <div className="rows" style={{ marginTop: 16 }}><Row /><Row /></div>
        </>
      )}
      {kind === 'list' && (
        <>
          <Bar w={110} h={12} />
          <div className="rows" style={{ marginTop: 14 }}><Row /><Row /><Row /><Row /></div>
        </>
      )}
      {slow && <p className="muted" style={{ marginTop: 20 }}>Waking the server. The first load can take up to a minute.</p>}
    </div>
  )
}
