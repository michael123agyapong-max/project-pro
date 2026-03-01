import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

const statusColor = { 'In Progress': '#5b8dee', 'Completed': '#4caf82', 'Pending': '#e05c5c', 'Paused': '#c9a84c' }
const fmt = n => 'GHS ' + Number(n||0).toLocaleString('en-GH', { minimumFractionDigits: 2 })
const COLORS = ['#c9a84c','#5b8dee','#4caf82','#e05c5c','#a87dc9','#e07c3d']
const getColor = name => COLORS[name.split('').reduce((h,c) => (h*31+c.charCodeAt(0)) % COLORS.length, 0)]
const initials = name => name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)

export default function Clients({ onSelectClient }) {
  const [clients, setClients] = useState([])
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name:'', phone:'', topic:'', type:'Thesis', status:'In Progress', total:'', deadline:'', notes:'' })

  useEffect(() => { loadClients() }, [])

  async function loadClients() {
    const { data } = await supabase.from('clients').select('*, payments(*)').order('created_at', { ascending: false })
    setClients(data || [])
  }

  async function saveClient() {
    if (!form.name || !form.topic) return alert('Name and topic are required')
    if (editing) {
      await supabase.from('clients').update(form).eq('id', editing)
    } else {
      await supabase.from('clients').insert(form)
    }
    setModal(false); setEditing(null)
    setForm({ name:'', phone:'', topic:'', type:'Thesis', status:'In Progress', total:'', deadline:'', notes:'' })
    loadClients()
  }

  async function deleteClient(id) {
    if (!confirm('Delete this client?')) return
    await supabase.from('clients').delete().eq('id', id)
    loadClients()
  }

  function openEdit(c) {
    setForm({ name:c.name, phone:c.phone||'', topic:c.topic, type:c.type, status:c.status, total:c.total||'', deadline:c.deadline||'', notes:c.notes||'' })
    setEditing(c.id); setModal(true)
  }

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.topic.toLowerCase().includes(search.toLowerCase())
  )

  const inp = { background:'#0d0f14', border:'1px solid #2a2f3d', borderRadius:8, padding:'10px 14px', color:'#e8eaf0', fontFamily:'sans-serif', fontSize:14, outline:'none', width:'100%' }
  const lbl = { fontSize:12, fontWeight:500, color:'#7a8098', textTransform:'uppercase', letterSpacing:0.8, marginBottom:6, display:'block' }

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:28}}>
        <div>
          <h2 style={{fontFamily:'Georgia,serif',fontSize:28}}>Clients</h2>
          <p style={{color:'#7a8098',fontSize:14,marginTop:4}}>Manage all your research clients</p>
        </div>
        <button onClick={() => { setEditing(null); setForm({ name:'', phone:'', topic:'', type:'Thesis', status:'In Progress', total:'', deadline:'', notes:'' }); setModal(true) }}
          style={{background:'linear-gradient(135deg,#c9a84c,#e8c97a)',color:'#0d0f14',border:'none',borderRadius:8,padding:'10px 20px',fontWeight:600,cursor:'pointer',fontSize:14}}>
          + Add Client
        </button>
      </div>

      <div style={{position:'relative',marginBottom:20}}>
        <span style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',color:'#7a8098'}}>🔍</span>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or topic..." style={{...inp, paddingLeft:40}} />
      </div>

      <div style={{background:'#161920',border:'1px solid #2a2f3d',borderRadius:18,overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr>{['Client','Topic','Type','Status','Paid / Total','Actions'].map(h=>(
              <th key={h} style={{padding:'12px 20px',textAlign:'left',fontSize:11,textTransform:'uppercase',letterSpacing:1.2,color:'#7a8098',borderBottom:'1px solid #2a2f3d'}}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {filtered.map(c => {
              const paid = (c.payments||[]).reduce((a,p)=>a+Number(p.amount),0)
              const col = getColor(c.name)
              return (
                <tr key={c.id} style={{borderBottom:'1px solid rgba(42,47,61,0.5)'}}>
                  <td style={{padding:'14px 20px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <div style={{width:34,height:34,borderRadius:'50%',background:`${col}22`,color:col,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:13}}>{initials(c.name)}</div>
                      <div>
                        <div style={{fontWeight:600,cursor:'pointer',color:'#e8eaf0'}} onClick={()=>onSelectClient(c.id)}>{c.name}</div>
                        <div style={{fontSize:12,color:'#7a8098'}}>{c.phone||'—'}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{padding:'14px 20px',color:'#7a8098',fontSize:13,maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.topic}</td>
                  <td style={{padding:'14px 20px',fontSize:13}}>{c.type}</td>
                  <td style={{padding:'14px 20px'}}>
                    <span style={{background:`${statusColor[c.status]}22`,color:statusColor[c.status],padding:'4px 10px',borderRadius:20,fontSize:11,fontWeight:600}}>{c.status}</span>
                  </td>
                  <td style={{padding:'14px 20px'}}>
                    <span style={{color:'#4caf82',fontWeight:600}}>{fmt(paid)}</span>
                    <span style={{color:'#7a8098',fontSize:12}}> / {fmt(c.total)}</span>
                  </td>
                  <td style={{padding:'14px 20px'}}>
                    <div style={{display:'flex',gap:6}}>
                      <button onClick={()=>onSelectClient(c.id)} style={{background:'#1e2230',border:'1px solid #2a2f3d',borderRadius:6,padding:'5px 12px',color:'#e8eaf0',cursor:'pointer',fontSize:12}}>View</button>
                      <button onClick={()=>openEdit(c)} style={{background:'#1e2230',border:'1px solid #2a2f3d',borderRadius:6,padding:'5px 12px',color:'#e8eaf0',cursor:'pointer',fontSize:12}}>Edit</button>
                      <button onClick={()=>deleteClient(c.id)} style={{background:'rgba(224,92,92,0.1)',border:'1px solid rgba(224,92,92,0.3)',borderRadius:6,padding:'5px 12px',color:'#e05c5c',cursor:'pointer',fontSize:12}}>Del</button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {filtered.length===0 && <tr><td colSpan={6} style={{padding:40,textAlign:'center',color:'#7a8098'}}>No clients found</td></tr>}
          </tbody>
        </table>
      </div>

      {modal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:200,padding:20}}>
          <div style={{background:'#161920',border:'1px solid #2a2f3d',borderRadius:18,width:'100%',maxWidth:560,maxHeight:'90vh',overflowY:'auto'}}>
            <div style={{padding:'24px 28px 18px',borderBottom:'1px solid #2a2f3d',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <h3 style={{fontFamily:'Georgia,serif',fontSize:20}}>{editing ? 'Edit Client' : 'Add New Client'}</h3>
              <button onClick={()=>setModal(false)} style={{background:'none',border:'none',color:'#7a8098',fontSize:22,cursor:'pointer'}}>×</button>
            </div>
            <div style={{padding:'24px 28px',display:'flex',flexDirection:'column',gap:14}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                <div><label style={lbl}>Client Name *</label><input style={inp} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Kwame Asante"/></div>
                <div><label style={lbl}>Phone</label><input style={inp} value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="0244000000"/></div>
              </div>
              <div><label style={lbl}>Research Topic *</label><input style={inp} value={form.topic} onChange={e=>setForm({...form,topic:e.target.value})} placeholder="Full title of the work"/></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                <div><label style={lbl}>Work Type</label>
                  <select style={inp} value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
                    <option>Thesis</option><option>Research Paper</option><option>Dissertation</option>
                  </select>
                </div>
                <div><label style={lbl}>Status</label>
                  <select style={inp} value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                    <option>In Progress</option><option>Completed</option><option>Pending</option><option>Paused</option>
                  </select>
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                <div><label style={lbl}>Total Agreed Fee (GHS)</label><input style={inp} type="number" value={form.total} onChange={e=>setForm({...form,total:e.target.value})} placeholder="0.00"/></div>
                <div><label style={lbl}>Deadline</label><input style={inp} type="date" value={form.deadline} onChange={e=>setForm({...form,deadline:e.target.value})}/></div>
              </div>
              <div><label style={lbl}>Notes</label><textarea style={{...inp,minHeight:80,resize:'vertical'}} value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Any extra details..."/></div>
            </div>
            <div style={{padding:'16px 28px 24px',display:'flex',gap:12,justifyContent:'flex-end'}}>
              <button onClick={()=>setModal(false)} style={{background:'#1e2230',border:'1px solid #2a2f3d',borderRadius:8,padding:'10px 20px',color:'#e8eaf0',cursor:'pointer'}}>Cancel</button>
              <button onClick={saveClient} style={{background:'linear-gradient(135deg,#c9a84c,#e8c97a)',color:'#0d0f14',border:'none',borderRadius:8,padding:'10px 20px',fontWeight:600,cursor:'pointer'}}>Save Client</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}