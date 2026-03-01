import { useState } from 'react'
import Sidebar from './components/sidebar.jsx'
import Dashboard from './components/Dashboard.jsx'
import Clients from './components/Clients.jsx'
import Payments from './components/Payments.jsx'
import ClientDetail from './components/ClientDetail.jsx'

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [selectedClient, setSelectedClient] = useState(null)

  function handleSelectClient(id) {
    setSelectedClient(id)
    setPage('detail')
  }

  function handleBack() {
    setSelectedClient(null)
    setPage('clients')
  }

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar page={page} setPage={setPage} />
      <main style={{ marginLeft: 240, padding: '32px 36px', minHeight: '100vh', flex: 1 }}>
        {page === 'dashboard' && <Dashboard setPage={setPage} />}
        {page === 'clients' && <Clients onSelectClient={handleSelectClient} />}
        {page === 'payments' && <Payments />}
        {page === 'detail' && selectedClient && <ClientDetail clientId={selectedClient} onBack={handleBack} />}
      </main>
    </div>
  )
}