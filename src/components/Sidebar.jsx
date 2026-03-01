import { useState } from 'react'

export default function Sidebar({ page, setPage }) {
  const [open, setOpen] = useState(false)

  const links = [
    { id: 'dashboard', label: 'Dashboard', icon: '▦' },
    { id: 'clients', label: 'Clients', icon: '👥' },
    { id: 'payments', label: 'Payments', icon: '💰' },
  ]

  function navigate(id) {
    setPage(id)
    setOpen(false)
  }

  return (
    <>
      {/* TOP BAR - always visible on mobile */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 56,
        background: '#161920', borderBottom: '1px solid #2a2f3d',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', zIndex: 200
      }}>
        <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 20, color: '#c9a84c' }}>Project Pro</h1>
        <button onClick={() => setOpen(!open)} style={{
          background: 'none', border: 'none', color: '#e8eaf0',
          cursor: 'pointer', fontSize: 22, padding: 4
        }}>
          {open ? '✕' : '☰'}
        </button>
      </div>

      {/* OVERLAY - clicking outside closes menu */}
      {open && (
        <div onClick={() => setOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 201
        }} />
      )}

      {/* SIDEBAR DRAWER */}
      <nav style={{
        position: 'fixed', left: 0, top: 0, bottom: 0, width: 240,
        background: '#161920', borderRight: '1px solid #2a2f3d',
        display: 'flex', flexDirection: 'column', zIndex: 202,
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease'
      }}>
        <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid #2a2f3d' }}>
          <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 22, color: '#c9a84c' }}>Project Pro</h1>
          <span style={{ fontSize: 11, color: '#7a8098', letterSpacing: 2, textTransform: 'uppercase' }}>Research Tracker</span>
        </div>
        <div style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {links.map(l => (
            <button key={l.id} onClick={() => navigate(l.id)} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 8,
              border: page === l.id ? '1px solid rgba(201,168,76,0.2)' : '1px solid transparent',
              background: page === l.id ? 'rgba(201,168,76,0.1)' : 'none',
              color: page === l.id ? '#c9a84c' : '#7a8098',
              fontFamily: 'sans-serif', fontSize: 14, fontWeight: 500, cursor: 'pointer', textAlign: 'left', width: '100%'
            }}>
              <span>{l.icon}</span>{l.label}
            </button>
          ))}
        </div>
      </nav>
    </>
  )
}