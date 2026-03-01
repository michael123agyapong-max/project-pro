export default function Sidebar({ page, setPage }) {
  const links = [
    { id: 'dashboard', label: 'Dashboard', icon: '▦' },
    { id: 'clients', label: 'Clients', icon: '👥' },
    { id: 'payments', label: 'Payments', icon: '💰' },
  ]
  return (
    <nav style={{position:'fixed',left:0,top:0,bottom:0,width:240,background:'#161920',borderRight:'1px solid #2a2f3d',display:'flex',flexDirection:'column',zIndex:100}}>
      <div style={{padding:'28px 24px 20px',borderBottom:'1px solid #2a2f3d'}}>
        <h1 style={{fontFamily:'Georgia,serif',fontSize:22,color:'#c9a84c'}}>Project Pro</h1>
        <span style={{fontSize:11,color:'#7a8098',letterSpacing:2,textTransform:'uppercase'}}>Research Tracker</span>
      </div>
      <div style={{flex:1,padding:'16px 12px',display:'flex',flexDirection:'column',gap:4}}>
        {links.map(l => (
          <button key={l.id} onClick={() => setPage(l.id)} style={{
            display:'flex',alignItems:'center',gap:12,padding:'11px 14px',borderRadius:8,
            border: page===l.id ? '1px solid rgba(201,168,76,0.2)' : '1px solid transparent',
            background: page===l.id ? 'rgba(201,168,76,0.1)' : 'none',
            color: page===l.id ? '#c9a84c' : '#7a8098',
            fontFamily:'sans-serif',fontSize:14,fontWeight:500,cursor:'pointer',textAlign:'left',width:'100%'
          }}>
            <span>{l.icon}</span>{l.label}
          </button>
        ))}
      </div>
    </nav>
  )
}