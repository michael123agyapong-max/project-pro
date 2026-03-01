import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

const fmt = n => 'GHS ' + Number(n||0).toLocaleString('en-GH', { minimumFractionDigits: 2 })
const statusColor = { 'In Progress': '#5b8dee', 'Completed': '#4caf82', 'Pending': '#e05c5c', 'Paused': '#c9a84c' }
const COLORS = ['#c9a84c','#5b8dee','#4caf82','#e05c5c','#a87dc9','#e07c3d']
const getColor = name => COLORS[name.split('').reduce((h,c)=>(h*31+c.charCodeAt(0))%COLORS.length,0)]
const initials = name => name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)

export default function ClientDetail({ clientId, onBack }) {
  const [client, setClient] = useState(null)
  const [payments, setPayments] = useState([])
  const [progress, setProgress] = useState([])
  const [newItem, setNewItem] = useState('')
  const [payModal, setPayModal] = useState(false)
  const [payForm, setPayForm] = useState({ amount:'', date: new Date().toISOString().split('T')[0], note:'' })

  useEffect(() => { loadAll() }, [clientId])

  async function loadAll() {
    const { data: c } = await supabase.from('clients').select('*').eq('id', clientId).single()
    const { data: p } = await supabase.from('payments').select('*').eq('client_id', clientId).order('date', { ascending: false })
    const { data: pr } = await supabase.from('progress_items').select('*').eq('client_id', clientId).order('created_at')
    setClient(c); setPayments(p||[]); setProgress(pr||[])
  }

  async function addProgress() {
    if (!newItem.trim()) return
    await supabase.from('progress_items').insert({ client_id: clientId, label: newItem.trim() })
    setNewItem(''); loadAll()
  }

  async function toggleProgress(item) {
    await supabase.from('progress_items').update({ done: !item.done }).eq('id', item.id)
    loadAll()
  }

  async function deleteProgress(id) {
    await supabase.from('progress_items').delete().eq('id', id)
    loadAll()
  }

  async function savePayment() {
    if (!payForm.amount || Number(payForm.amount) <= 0) return alert('Enter a valid amount')
    await supabase.from('payments').insert({ client_id: clientId, amount: Number(payForm.amount), date: payForm.date, note: payForm.note })
    setPayModal(false); setPayForm({ amount:'', date: new Date().toISOString().split('T')[0], note:'' }); loadAll()
  }

  if (!client) return <div style={{color:'#7a8098',padding:40}}>Loading...</div>

  const paid = payments.reduce((a,p)=>a+Number(p.amount),0)
  const total = Number(client.total||0)
  const remaining = total - paid
  const pct = total > 0 ? Math.min(100,(paid/total)*100) : 0
  const col = getColor(client.name)
  const inp = { background:'#0d0f14', border:'1px solid #2a2f3d', borderRadius:8, padding:'10px 14px', color:'#e8eaf0', fontFamily:'sans-serif', fontSize:14, outline:'none', width:'100%' }
  const lbl = { fontSize:12, fontWeight:500, color:'#7a8098', textTransform:'uppercase', letterSpacing:0.8, marginBottom:6, display:'block' }

  return (
    <div>
      <button onClick={onBack} style={{background:'none',border:'none',color:'#7a8098',cursor:'pointer',fontSize:14,marginBottom:20,display:'flex',alignItems:'center',gap:6}}>← Back to Clients</button>

      <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:24}}>
        <div style={{width:52,height:52,borderRadius:'50%',background:`${col}22`,color:col,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:18}}>{initials(client.name)}</div>
        <div>
          <h2 style={{fontFamily:'Georgia,serif',fontSize:24}}>{client.name}</h2>
          <div style={{color:'#7a8098',fontSize:13,marginTop:2}}>{client.type} • {client.phone||'No contact'}</div>
        </div>
        <div style={{marginLeft:'auto',display:'flex',gap:8}}>
          <button onClick={()=>setPayModal(true)} style={{background:'linear-gradient(135deg,#c9a84c,#e8c97a)',color:'#0d0f14',border:'none',borderRadius:8,padding:'8px 16px',fontWeight:600,cursor:'pointer',fontSize:13}}>+ Payment</button>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20}}>
        <div style={{background:'#161920',border:'1px solid #2a2f3d',borderRadius:12,padding:20}}>
          <div style={{fontSize:11,textTransform:'uppercase',letterSpacing:1.5,color:'#7a8098',marginBottom:14}}>Project Info</div>
          <div style={{fontSize:13,color:'#e8eaf0',marginBottom:12,lineHeight:1.6}}>{client.topic}</div>
          {[['Status', <span style={{background:`${statusColor[client.status]}22`,color:statusColor[client.status],padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:600}}>{client.status}</span>],
            ['Type', client.type], ['Deadline', client.deadline||'—']].map(([k,v])=>(
            <div key={k} style={{display:'flex',justifyContent:'space-between',marginBottom:10,fontSize:14}}>
              <span style={{color:'#7a8098'}}>{k}</span><span style={{fontWeight:500}}>{v}</span>
            </div>
          ))}
          {client.notes && <div style={{marginTop:10,fontSize:13,color:'#7a8098',background:'#0d0f14',padding:'10px 12px',borderRadius:6}}>{client.notes}</div>}
        </div>

        <div style={{background:'#161920',border:'1px solid #2a2f3d',borderRadius:12,padding:20}}>
          <div style={{fontSize:11,textTransform:'uppercase',letterSpacing:1.5,color:'#7a8098',marginBottom:14}}>Payment Summary</div>
          {[['Total Agreed', fmt(total), '#e8eaf0'], ['Amount Paid', fmt(paid), '#4caf82'], ['Outstanding', fmt(remaining), remaining>0?'#e05c5c':'#4caf82']].map(([k,v,c])=>(
            <div key={k} style={{display:'flex',justifyContent:'space-between',marginBottom:10,fontSize:14}}>
              <span style={{color:'#7a8098'}}>{k}</span><span style={{fontWeight:600,color:c}}>{v}</span>
            </div>
          ))}
          <div style={{marginTop:14}}>
            <div style={{height:6,background:'#2a2f3d',borderRadius:3,overflow:'hidden'}}>
              <div style={{height:'100%',width:`${pct}%`,background:'linear-gradient(90deg,#4caf82,#7adbb0)',borderRadius:3,transition:'width 0.5s'}}></div>
            </div>
            <div style={{fontSize:11,color:'#7a8098',marginTop:6}}>{Math.round(pct)}% paid</div>
          </div>
        </div>
      </div>

      <div style={{background:'#161920',border:'1px solid #2a2f3d',borderRadius:12,marginBottom:20}}>
        <div style={{padding:'18px 22px',borderBottom:'1px solid #2a2f3d',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h3 style={{fontSize:15,fontWeight:600}}>Work Progress</h3>
          <span style={{fontSize:12,color:'#7a8098'}}>{progress.filter(p=>p.done).length}/{progress.length} done</span>
        </div>
        <div style={{padding:20}}>
          {progress.length === 0 && <div style={{color:'#7a8098',fontSize:14,textAlign:'center',padding:'20px 0'}}>No items yet. Add chapters, questionnaires, etc.</div>}
          {progress.map(item => (
            <div key={item.id} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',background:'#0d0f14',borderRadius:8,border:`1px solid ${item.done?'rgba(76,175,130,0.3)':'#2a2f3d'}`,marginBottom:8}}>
              <div onClick={()=>toggleProgress(item)} style={{width:22,height:22,borderRadius:'50%',border:`2px solid ${item.done?'#4caf82':'#2a2f3d'}`,background:item.done?'#4caf82':'none',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0}}>
                {item.done && <span style={{color:'white',fontSize:12}}>✓</span>}
              </div>
              <span style={{flex:1,fontSize:14,textDecoration:item.done?'line-through':'none',color:item.done?'#7a8098':'#e8eaf0'}}>{item.label}</span>
              <button onClick={()=>deleteProgress(item.id)} style={{background:'none',border:'none',color:'#7a8098',cursor:'pointer',fontSize:16}}>×</button>
            </div>
          ))}
          <div style={{display:'flex',gap:8,marginTop:8}}>
            <input value={newItem} onChange={e=>setNewItem(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addProgress()} placeholder="Add item (e.g. Chapter 1, Questionnaire...)" style={{...inp,flex:1}}/>
            <button onClick={addProgress} style={{background:'#1e2230',border:'1px solid #2a2f3d',borderRadius:8,padding:'10px 16px',color:'#e8eaf0',cursor:'pointer',fontSize:13}}>+ Add</button>
          </div>
        </div>
      </div>

      <div style={{background:'#161920',border:'1px solid #2a2f3d',borderRadius:12}}>
        <div style={{padding:'18px 22px',borderBottom:'1px solid #2a2f3d',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h3 style={{fontSize:15,fontWeight:600}}>Payment History</h3>
          <button onClick={()=>setPayModal(true)} style={{background:'linear-gradient(135deg,#c9a84c,#e8c97a)',color:'#0d0f14',border:'none',borderRadius:8,padding:'6px 14px',fontWeight:600,cursor:'pointer',fontSize:12}}>+ Add</button>
        </div>
        <div style={{padding:20}}>
          {payments.length===0 && <div style={{color:'#7a8098',fontSize:14,textAlign:'center',padding:'20px 0'}}>No payments recorded yet</div>}
          {payments.map(p=>(
            <div key={p.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 16px',background:'#0d0f14',borderRadius:8,border:'1px solid #2a2f3d',marginBottom:8}}>
              <div>
                <div style={{fontWeight:500,fontSize:14}}>{p.note||'Payment'}</div>
                <div style={{fontSize:12,color:'#7a8098'}}>{p.date}</div>
              </div>
              <div style={{color:'#4caf82',fontWeight:600,fontSize:15}}>{fmt(p.amount)}</div>
            </div>
          ))}
        </div>
      </div>

      {payModal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:200,padding:20}}>
          <div style={{background:'#161920',border:'1px solid #2a2f3d',borderRadius:18,width:'100%',maxWidth:420}}>
            <div style={{padding:'24px 28px 18px',borderBottom:'1px solid #2a2f3d',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <h3 style={{fontFamily:'Georgia,serif',fontSize:20}}>Record Payment</h3>
              <button onClick={()=>setPayModal(false)} style={{background:'none',border:'none',color:'#7a8098',fontSize:22,cursor:'pointer'}}>×</button>
            </div>
            <div style={{padding:'24px 28px',display:'flex',flexDirection:'column',gap:14}}>
              <div><label style={lbl}>Amount (GHS)</label><input style={inp} type="number" value={payForm.amount} onChange={e=>setPayForm({...payForm,amount:e.target.value})} placeholder="0.00"/></div>
              <div><label style={lbl}>Date</label><input style={inp} type="date" value={payForm.date} onChange={e=>setPayForm({...payForm,date:e.target.value})}/></div>
              <div><label style={lbl}>Note (optional)</label><input style={inp} value={payForm.note} onChange={e=>setPayForm({...payForm,note:e.target.value})} placeholder="e.g. Initial deposit"/></div>
            </div>
            <div style={{padding:'16px 28px 24px',display:'flex',gap:12,justifyContent:'flex-end'}}>
              <button onClick={()=>setPayModal(false)} style={{background:'#1e2230',border:'1px solid #2a2f3d',borderRadius:8,padding:'10px 20px',color:'#e8eaf0',cursor:'pointer'}}>Cancel</button>
              <button onClick={savePayment} style={{background:'linear-gradient(135deg,#c9a84c,#e8c97a)',color:'#0d0f14',border:'none',borderRadius:8,padding:'10px 20px',fontWeight:600,cursor:'pointer'}}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}