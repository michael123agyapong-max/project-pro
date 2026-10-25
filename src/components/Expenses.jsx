import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

const fmt = n => 'GHS ' + Number(n || 0).toLocaleString('en-GH', { minimumFractionDigits: 2 })
const CATEGORY_SUGGESTIONS = ['Transport', 'Data/Internet', 'Printing & Binding', 'Revenue Share', 'Software/Subscriptions', 'Other']
const emptyForm = { date: new Date().toISOString().split('T')[0], category: '', amount: '', note: '' }

export default function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)

  useEffect(() => { loadExpenses() }, [])

  async function loadExpenses() {
    const { data } = await supabase.from('expenses').select('*').order('date', { ascending: false })
    setExpenses(data || [])
  }

  async function saveExpense() {
    if (!form.category.trim() || !form.amount || Number(form.amount) <= 0) return alert('Category and a valid amount are required')
    const payload = { date: form.date, category: form.category.trim(), amount: Number(form.amount), note: form.note.trim() || null }
    if (editing) {
      await supabase.from('expenses').update(payload).eq('id', editing)
    } else {
      await supabase.from('expenses').insert(payload)
    }
    setModal(false); setEditing(null); setForm(emptyForm)
    loadExpenses()
  }

  async function deleteExpense(id) {
    if (!confirm('Delete this expense?')) return
    await supabase.from('expenses').delete().eq('id', id)
    loadExpenses()
  }

  function openEdit(e) {
    setForm({ date: e.date, category: e.category, amount: e.amount, note: e.note || '' })
    setEditing(e.id); setModal(true)
  }

  function openAdd() {
    setForm(emptyForm); setEditing(null); setModal(true)
  }

  const total = expenses.reduce((a, e) => a + Number(e.amount), 0)
  const inp = { background:'#0d0f14', border:'1px solid #2a2f3d', borderRadius:8, padding:'10px 14px', color:'#e8eaf0', fontFamily:'sans-serif', fontSize:14, outline:'none', width:'100%' }
  const lbl = { fontSize:12, fontWeight:500, color:'#7a8098', textTransform:'uppercase', letterSpacing:0.8, marginBottom:6, display:'block' }

  return (
    <div>
      <style>{`
        .expenses-table { display: none; }
        .expenses-cards { display: flex; flex-direction: column; gap: 10px; }
        @media (min-width: 768px) {
          .expenses-table { display: block; }
          .expenses-cards { display: none; }
        }
      `}</style>

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20,gap:12,flexWrap:'wrap'}}>
        <div>
          <h2 style={{fontFamily:'Georgia,serif',fontSize:26}}>Expenses</h2>
          <p style={{color:'#7a8098',fontSize:13,marginTop:4}}>Operating costs and revenue shares — deducted from revenue</p>
        </div>
        <button onClick={openAdd} style={{background:'linear-gradient(135deg,#c9a84c,#e8c97a)',color:'#0d0f14',border:'none',borderRadius:8,padding:'10px 16px',fontWeight:600,cursor:'pointer',fontSize:13, whiteSpace:'nowrap'}}>
          + Add Expense
        </button>
      </div>

      <div style={{background:'#161920',border:'1px solid #2a2f3d',borderTop:'3px solid #e05c5c',borderRadius:14,padding:16,marginBottom:20,maxWidth:260}}>
        <div style={{fontSize:10,textTransform:'uppercase',letterSpacing:1.2,color:'#7a8098',marginBottom:8}}>Total Expenses</div>
        <div style={{fontFamily:'Georgia,serif',fontSize:20}}>{fmt(total)}</div>
      </div>

      {/* MOBILE CARDS */}
      <div className="expenses-cards">
        {expenses.length === 0 && <div style={{textAlign:'center',color:'#7a8098',padding:30,background:'#161920',borderRadius:12,border:'1px solid #2a2f3d'}}>No expenses recorded yet</div>}
        {expenses.map(e => (
          <div key={e.id} style={{background:'#161920',border:'1px solid #2a2f3d',borderRadius:12,padding:14}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
              <div style={{fontWeight:600,fontSize:14}}>{e.category}</div>
              <div style={{color:'#e05c5c',fontWeight:600,fontSize:14}}>-{fmt(e.amount)}</div>
            </div>
            {e.note && <div style={{fontSize:12,color:'#7a8098',marginBottom:8}}>{e.note}</div>}
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:12,color:'#7a8098'}}>
              <span>{e.date}</span>
              <div style={{display:'flex',gap:8}}>
                <button onClick={()=>openEdit(e)} style={{background:'#1e2230',border:'1px solid #2a2f3d',borderRadius:6,padding:'5px 10px',color:'#e8eaf0',cursor:'pointer',fontSize:11}}>Edit</button>
                <button onClick={()=>deleteExpense(e.id)} style={{background:'rgba(224,92,92,0.1)',border:'1px solid rgba(224,92,92,0.3)',borderRadius:6,padding:'5px 10px',color:'#e05c5c',cursor:'pointer',fontSize:11}}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP TABLE */}
      <div className="expenses-table" style={{background:'#161920',border:'1px solid #2a2f3d',borderRadius:18,overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr>{['Date','Category','Note','Amount','Actions'].map(h=>(
              <th key={h} style={{padding:'12px 20px',textAlign:'left',fontSize:11,textTransform:'uppercase',letterSpacing:1.2,color:'#7a8098',borderBottom:'1px solid #2a2f3d'}}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {expenses.map(e => (
              <tr key={e.id} style={{borderBottom:'1px solid rgba(42,47,61,0.5)'}}>
                <td style={{padding:'14px 20px',fontSize:13,color:'#7a8098'}}>{e.date}</td>
                <td style={{padding:'14px 20px',fontWeight:500}}>{e.category}</td>
                <td style={{padding:'14px 20px',color:'#7a8098',fontSize:13,maxWidth:260,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{e.note||'—'}</td>
                <td style={{padding:'14px 20px',color:'#e05c5c',fontWeight:600}}>-{fmt(e.amount)}</td>
                <td style={{padding:'14px 20px'}}>
                  <div style={{display:'flex',gap:6}}>
                    <button onClick={()=>openEdit(e)} style={{background:'#1e2230',border:'1px solid #2a2f3d',borderRadius:6,padding:'5px 12px',color:'#e8eaf0',cursor:'pointer',fontSize:12}}>Edit</button>
                    <button onClick={()=>deleteExpense(e.id)} style={{background:'rgba(224,92,92,0.1)',border:'1px solid rgba(224,92,92,0.3)',borderRadius:6,padding:'5px 12px',color:'#e05c5c',cursor:'pointer',fontSize:12}}>Del</button>
                  </div>
                </td>
              </tr>
            ))}
            {expenses.length===0 && <tr><td colSpan={5} style={{padding:40,textAlign:'center',color:'#7a8098'}}>No expenses recorded yet</td></tr>}
          </tbody>
        </table>
      </div>

      {modal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:200,padding:20}}>
          <div style={{background:'#161920',border:'1px solid #2a2f3d',borderRadius:18,width:'100%',maxWidth:420}}>
            <div style={{padding:'24px 28px 18px',borderBottom:'1px solid #2a2f3d',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <h3 style={{fontFamily:'Georgia,serif',fontSize:20}}>{editing ? 'Edit Expense' : 'Add Expense'}</h3>
              <button onClick={()=>setModal(false)} style={{background:'none',border:'none',color:'#7a8098',fontSize:22,cursor:'pointer'}}>×</button>
            </div>
            <div style={{padding:'24px 28px',display:'flex',flexDirection:'column',gap:14}}>
              <div>
                <label style={lbl}>Category *</label>
                <input style={inp} list="expense-categories" value={form.category} onChange={e=>setForm({...form,category:e.target.value})} placeholder="e.g. Transport, Revenue Share..."/>
                <datalist id="expense-categories">
                  {CATEGORY_SUGGESTIONS.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>
              <div>
                <label style={lbl}>Amount (GHS) *</label>
                <input style={inp} type="number" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} placeholder="0.00"/>
              </div>
              <div>
                <label style={lbl}>Date</label>
                <input style={inp} type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/>
              </div>
              <div>
                <label style={lbl}>Note (optional)</label>
                <textarea style={{...inp,minHeight:70,resize:'vertical'}} value={form.note} onChange={e=>setForm({...form,note:e.target.value})} placeholder="Any extra details..."/>
              </div>
            </div>
            <div style={{padding:'16px 28px 24px',display:'flex',gap:12,justifyContent:'flex-end'}}>
              <button onClick={()=>setModal(false)} style={{background:'#1e2230',border:'1px solid #2a2f3d',borderRadius:8,padding:'10px 20px',color:'#e8eaf0',cursor:'pointer'}}>Cancel</button>
              <button onClick={saveExpense} style={{background:'linear-gradient(135deg,#c9a84c,#e8c97a)',color:'#0d0f14',border:'none',borderRadius:8,padding:'10px 20px',fontWeight:600,cursor:'pointer'}}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
