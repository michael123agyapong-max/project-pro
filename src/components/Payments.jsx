import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

const fmt = n => 'GHS ' + Number(n||0).toLocaleString('en-GH', { minimumFractionDigits: 2 })
const COLORS = ['#c9a84c','#5b8dee','#4caf82','#e05c5c','#a87dc9','#e07c3d']
const getColor = name => COLORS[name.split('').reduce((h,c)=>(h*31+c.charCodeAt(0))%COLORS.length,0)]
const initials = name => name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)

export default function Payments() {
  const [payments, setPayments] = useState([])

  useEffect(() => { loadPayments() }, [])

  async function loadPayments() {
    const { data } = await supabase.from('payments').select('*, clients(name)').order('date', { ascending: false })
    setPayments(data || [])
  }

  return (
    <div>
      <div style={{marginBottom:28}}>
        <h2 style={{fontFamily:'Georgia,serif',fontSize:28}}>Payment Log</h2>
        <p style={{color:'#7a8098',fontSize:14,marginTop:4}}>All payment records across clients</p>
      </div>
      <div style={{background:'#161920',border:'1px solid #2a2f3d',borderRadius:18,padding:20}}>
        {payments.length === 0 && <div style={{padding:40,textAlign:'center',color:'#7a8098'}}>No payments recorded yet</div>}
        {payments.map(p => {
          const name = p.clients?.name || 'Unknown'
          const col = getColor(name)
          return (
            <div key={p.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 16px',background:'#0d0f14',borderRadius:8,border:'1px solid #2a2f3d',marginBottom:8}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:34,height:34,borderRadius:'50%',background:`${col}22`,color:col,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:13}}>{initials(name)}</div>
                <div>
                  <div style={{fontWeight:500}}>{name}</div>
                  <div style={{fontSize:12,color:'#7a8098'}}>{p.note||'Payment'} • {p.date}</div>
                </div>
              </div>
              <div style={{color:'#4caf82',fontWeight:600,fontSize:15}}>{fmt(p.amount)}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}