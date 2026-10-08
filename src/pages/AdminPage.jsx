import { useEffect, useState } from 'react'
import { API, clearSession, logout } from '../api'

const views = {
  employees: {
    columns: [['employee_id', 'Emp ID'], ['name', 'Name'], ['department', 'Department'], ['role', 'Role'], ['created_at', 'Created']],
    filters: ['employee_id']
  },
  bookings: {
    columns: [['employee_id', 'Emp ID'], ['location', 'Location'], ['floor', 'Floor'], ['bay', 'Bay'], ['booking_type', 'Booking Type'], ['workspace', 'Desk or Room'], ['date', 'Date'], ['from', 'From'], ['to', 'To'], ['lunch', 'Lunch'], ['snacks', 'Snacks'], ['status', 'Status']],
    filters: ['employee_id', 'location', 'floor', 'date', 'status']
  },
  'login-history': {
    columns: [['employee_id', 'Emp ID'], ['event', 'Event'], ['created_at', 'Date and Time']],
    filters: ['employee_id', 'date', 'status']
  },
  workspaces: {
    columns: [['location', 'Location'], ['floor', 'Floor'], ['bay', 'Bay'], ['bay_type', 'Bay Type'], ['workspace', 'Desk or Room'], ['workspace_type', 'Type'], ['capacity', 'Capacity'], ['status', 'Status']],
    filters: ['location', 'floor']
  }
}

const filterDetails = {
  employee_id: ['Emp ID', 'text', 'e.g. 12345'],
  location: ['Location', 'text', 'Location name'],
  floor: ['Floor', 'text', 'Floor name'],
  date: ['Date', 'date', ''],
  status: ['Status', 'text', 'Booking status']
}

export default function AdminPage() {
  const [user, setUser] = useState(null)
  const [activeView, setActiveView] = useState('employees')
  const [draftFilters, setDraftFilters] = useState({})
  const [filterValues, setFilterValues] = useState({})
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('Loading records…')

  useEffect(() => {
    const token = sessionStorage.getItem('flexdesk_token')
    if (!token) {
      window.location.replace('/login.html')
      return
    }
    fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        if (response.status === 401) {
          clearSession()
          window.location.replace('/login.html')
          return null
        }
        if (!response.ok) throw new Error('Unable to verify administrator access.')
        return response.json()
      })
      .then((currentUser) => {
        if (!currentUser) return
        if (currentUser.role !== 'admin') {
          window.location.replace('/')
          return
        }
        setUser(currentUser)
      })
      .catch((error) => setStatus(error.message))
  }, [])

  useEffect(() => {
    if (!user) return
    const token = sessionStorage.getItem('flexdesk_token')
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(filterValues)) {
      if (!value) continue
      const target = key === 'date'
        ? activeView === 'login-history' ? 'event_date' : 'booking_date'
        : key === 'status' && activeView === 'login-history' ? 'event' : key
      params.set(target, value)
    }
    setStatus('Loading records…')
    fetch(`${API}/admin/${activeView}?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        if (response.status === 401) {
          clearSession()
          window.location.replace('/login.html')
          return null
        }
        if (response.status === 403) {
          window.location.replace('/')
          return null
        }
        const result = await response.json()
        if (!response.ok) throw new Error(typeof result.detail === 'string' ? result.detail : 'Unable to load admin data.')
        return result
      })
      .then((result) => {
        if (result) {
          setItems(result)
          setStatus(result.length ? '' : 'No records found for these filters.')
        }
      })
      .catch((error) => setStatus(error.message))
  }, [activeView, filterValues, user])

  const selectedView = views[activeView]

  return (
    <div className="admin-page">
      <header className="admin-topbar"><a href="/" className="admin-brand">FLEXDESK<small>SMART WORKSPACE SYSTEM</small></a><button type="button" onClick={() => logout().catch((error) => window.alert(error.message))}>Logout</button></header>
      <main className="admin-main">
        <section className="admin-heading"><div><p>CONTROL CENTER</p><h1>Administration</h1></div><span>{user?.name || 'Administrator access'}</span></section>
        <nav className="admin-tabs" aria-label="Admin data views">
          {Object.keys(views).map((view) => <button type="button" key={view} aria-selected={view === activeView} onClick={() => { setActiveView(view); setDraftFilters({}); setFilterValues({}) }}>{view === 'employees' ? 'Employees' : view === 'bookings' ? 'All Bookings' : view === 'login-history' ? 'Login History' : 'Workspaces'}</button>)}
        </nav>
        <section className="admin-panel">
          <form className="admin-filters" onSubmit={(event) => { event.preventDefault(); setFilterValues(draftFilters) }}>
            {selectedView.filters.map((key) => {
              const [label, type, placeholder] = filterDetails[key]
              return <div className="admin-filter" key={key}><label htmlFor={`admin-${key}`}>{label}</label><input id={`admin-${key}`} name={key} type={type} placeholder={placeholder} value={draftFilters[key] || ''} onChange={(event) => setDraftFilters((values) => ({ ...values, [key]: event.target.value }))} /></div>
            })}
            <button type="submit">Apply filters</button>
          </form>
          {activeView === 'bookings' && <p className="admin-notice">Lunch and snacks are not recorded in the database booking table and appear as —.</p>}
          {status
            ? <div className={`admin-result${status.startsWith('Unable') || status.startsWith('Request') ? ' error' : ''}`} role="status">{status}</div>
            : <div className="admin-table-wrap"><table><thead><tr>{selectedView.columns.map(([, label]) => <th key={label}>{label}</th>)}</tr></thead><tbody>{items.map((item, index) => <tr key={`${item.employee_id || item.workspace || item.event}-${index}`}>{selectedView.columns.map(([key]) => <td key={key}>{item[key] ?? '—'}</td>)}</tr>)}</tbody></table></div>}
        </section>
      </main>
    </div>
  )
}
