import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

export default function Dashboard({ setPage }) {
  const [stats, setStats] = useState({ revenue: 0, completed: 0, inProgress: 0, expected: 0 })
  const [recent, setRecent] = useState([])

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: clients } = await supabase.from('clients').select('*, payments(*)')
    if (!clients) return
    const revenue = clients.reduce((s, c) => s + (c.payments||[]).reduce((a, p) => a + Number(p.amount), 0), 0)
    const expected = clients.reduce((s, c) => {
      const paid = (c.payments||[]).reduce((a, p) => a + Number(p.amount), 0)
      return s + (Number(c.total||0) - paid)
    }, 0)
    setStats({
      revenue,
      completed: clients.filter(c => c.status === 'Completed').length,
      inProgress: clients.filter(c => c.status === 'In Progress').length,
      expected
    })
    setRecent(clients.slice(-5).reverse())
  }

  const fmt = n => 'GHS ' + Number(n||0).toLocaleString('en-GH', { minimumFractionDigits: 2 })
  const statusColor = { 'In Progress': '#5b8dee', 'Completed': '#4caf82', 'Pending': '#e05c5c', 'Paused': '#c9a84c' }

  return (
    <div>
      <style>{`
        .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
        .recent-table { display: block; }
        .recent-table-desktop { display: none; }
        .recent-card { background: #1e2230; border: 1px solid #2a2f3d; border-radius: 10px; padding: 14px; margin-bottom: 10px; }
        @media (min-width: 768px) {
          .stat-grid { grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
          .recent-table { display: none; }
          .recent-table-desktop { display: block; }
        }
      `}</style>

      <div style={{marginBottom: 20}}>
        <h2 style={{fontFamily:'Georgia,serif', fontSize:26}}>Dashboard</h2>
        <p style={{color:'#7a8098', fontSize:13, marginTop:4}}>Welcome back — here's your business overview</p>
      </div>

      {/* STAT CARDS */}
      <div className="stat-grid">
        {[
          { label: 'Total Revenue', value: fmt(stats.revenue), sub: 'Received', color: '#c9a84c' },
          { label: 'Completed', value: stats.completed, sub: 'Works done', color: '#4caf82' },
          { label: 'In Progress', value: stats.inProgress, sub: 'Active', color: '#5b8dee' },
          { label: 'Expected', value: fmt(stats.expected), sub: 'Outstanding', color: '#e07c3d' },
        ].map(s => (
          <div key={s.label} style={{
            background:'#161920', border:'1px solid #2a2f3d', borderRadius:14,
            padding:16, borderTop:`3px solid ${s.color}`
          }}>
            <div style={{fontSize:10, textTransform:'uppercase', letterSpacing:1.2, color:'#7a8098', marginBottom:8}}>{s.label}</div>
            <div style={{fontFamily:'Georgia,serif', fontSize:20, wordBreak:'break-word'}}>{s.value}</div>
            <div style={{fontSize:11, color:'#7a8098', marginTop:4}}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* RECENT CLIENTS - MOBILE CARDS */}
      <div className="recent-table">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
          <h3 style={{fontSize:15, fontWeight:600}}>Recent Clients</h3>
          <button onClick={() => setPage('clients')} style={{background:'#1e2230',border:'1px solid #2a2f3d',borderRadius:8,padding:'6px 12px',color:'#e8eaf0',cursor:'pointer',fontSize:12}}>View All</button>
        </div>
        {recent.length === 0 && <div style={{textAlign:'center', color:'#7a8098', padding:30, background:'#161920', borderRadius:12, border:'1px solid #2a2f3d'}}>No clients yet</div>}
        {recent.map(c => {
          const paid = (c.payments||[]).reduce((a, p) => a + Number(p.amount), 0)
          return (
            <div key={c.id} className="recent-card">
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8}}>
                <div style={{fontWeight:600, fontSize:15}}>{c.name}</div>
                <span style={{background:`${statusColor[c.status]}22`, color:statusColor[c.status], padding:'3px 8px', borderRadius:20, fontSize:11, fontWeight:600}}>{c.status}</span>
              </div>
              <div style={{color:'#7a8098', fontSize:12, marginBottom:8, lineHeight:1.4}}>{c.topic}</div>
              <div style={{display:'flex', justifyContent:'space-between', fontSize:13}}>
                <span style={{color:'#7a8098'}}>{c.type}</span>
                <span><span style={{color:'#4caf82', fontWeight:600}}>{fmt(paid)}</span><span style={{color:'#7a8098'}}> / {fmt(c.total)}</span></span>
              </div>
            </div>
          )
        })}
      </div>

      {/* RECENT CLIENTS - DESKTOP TABLE */}
      <div className="recent-table-desktop" style={{background:'#161920',border:'1px solid #2a2f3d',borderRadius:18,overflow:'hidden'}}>
        <div style={{padding:'18px 22px',borderBottom:'1px solid #2a2f3d',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h3 style={{fontSize:15,fontWeight:600}}>Recent Clients</h3>
          <button onClick={() => setPage('clients')} style={{background:'#1e2230',border:'1px solid #2a2f3d',borderRadius:8,padding:'6px 14px',color:'#e8eaf0',cursor:'pointer',fontSize:12}}>View All</button>
        </div>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr>{['Client','Topic','Type','Status','Paid / Total'].map(h => (
              <th key={h} style={{padding:'12px 20px',textAlign:'left',fontSize:11,textTransform:'uppercase',letterSpacing:1.2,color:'#7a8098',borderBottom:'1px solid #2a2f3d'}}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {recent.map(c => {
              const paid = (c.payments||[]).reduce((a, p) => a + Number(p.amount), 0)
              return (
                <tr key={c.id}>
                  <td style={{padding:'14px 20px',fontWeight:600}}>{c.name}</td>
                  <td style={{padding:'14px 20px',color:'#7a8098',fontSize:13,maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.topic}</td>
                  <td style={{padding:'14px 20px',fontSize:13}}>{c.type}</td>
                  <td style={{padding:'14px 20px'}}>
                    <span style={{background:`${statusColor[c.status]}22`,color:statusColor[c.status],padding:'4px 10px',borderRadius:20,fontSize:11,fontWeight:600}}>{c.status}</span>
                  </td>
                  <td style={{padding:'14px 20px'}}>
                    <span style={{color:'#4caf82',fontWeight:600}}>{fmt(paid)}</span>
                    <span style={{color:'#7a8098',fontSize:12}}> / {fmt(c.total)}</span>
                  </td>
                </tr>
              )
            })}
            {recent.length === 0 && <tr><td colSpan={5} style={{padding:40,textAlign:'center',color:'#7a8098'}}>No clients yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}